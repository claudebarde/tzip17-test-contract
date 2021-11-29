let get_expiry ((user, param_hash): (address * bytes)) (s: storage): seconds =
    match Big_map.find_opt (user, param_hash) s.permit_expiries with
    | None ->
        begin
            match Big_map.find_opt user s.user_expiries with
            | None -> s.default_expiry
            | Some exp -> 
                begin
                    match exp with
                    | None -> s.default_expiry
                    | Some t -> t
                end
        end
    | Some p ->
        begin
            match p with
            | None -> s.default_expiry
            | Some exp -> exp
        end

let permit (param, s: (permit_params list) * storage): operation list * storage =
    let new_storage = 
        List.fold
            (
                fun (storage, permit: storage * permit_params) ->
                    let (user_public_key, (hash_signature, param_hash)) = permit in
                    // validates the signature
                    let packed_params_bytes = Bytes.pack ((Tezos.chain_id, Tezos.self_address), (s.counter, param_hash)) in
                    if Crypto.check user_public_key hash_signature packed_params_bytes
                    then
                        let sender_address = Tezos.address (Tezos.implicit_account (Crypto.hash_key user_public_key)) in
                        let permit_key = sender_address, param_hash in
                        // checks if permit doesn't already exist
                        match Big_map.find_opt permit_key storage.permits with
                        | None -> 
                            { 
                                storage with 
                                    permits = Big_map.add permit_key Tezos.now storage.permits;
                                    counter = storage.counter + 1n
                            }
                        | Some submission_timestamp ->
                            begin
                                let effective_expiry: seconds = get_expiry permit_key storage in
                                if abs (Tezos.now - submission_timestamp) < effective_expiry
                                then (failwith "DUP_PERMIT": storage)
                                else 
                                    { 
                                        storage with 
                                            permits = Big_map.update permit_key (Some Tezos.now) storage.permits;
                                            counter = storage.counter + 1n
                                    }
                            end
                    else
                        let missigned (error_message, params_bytes: string * bytes): storage =
                            [%Michelson ({| { FAILWITH } |} : string * bytes -> storage)] (error_message, params_bytes) 
                        in missigned (("MISSIGNED", packed_params_bytes))
            )
            param
            s
    in ([]: operation list), new_storage

let set_expiry (p, s: expiry_params * storage): operation list * storage =
    let (user_address, (seconds, permit_hash_opt)) = p in
    if seconds > s.max_expiry
    then (failwith "MAX_SECONDS_EXCEEDED": operation list * storage)
    else if Tezos.sender <> user_address
    then (failwith "FORBIDDEN_EXPIRY_UPDATE": operation list * storage)
    else
        let new_storage = 
            match permit_hash_opt with
            | None ->
                // user wants to set up his general permit expiry
                {
                    s with user_expiries = Big_map.add user_address (Some seconds) s.user_expiries
                }
            | Some permit_hash ->
                // user wants to set up an expiry for a given permit
                {
                    s with permit_expiries = Big_map.add (user_address, permit_hash) (Some seconds) s.permit_expiries
                }
        in ([]: operation list), new_storage

let transfer_presigned (params, s: transfer * storage): bool * storage =
    // creates hash for the bigmap key
    let params_hash = Crypto.blake2b (Bytes.pack params) in
    let permit_submit_time: timestamp =
        match Big_map.find_opt (params.address_from, params_hash) s.permits with
        | None -> (0: timestamp)
        | Some exp -> exp
    in
    if permit_submit_time = (0: timestamp)
    then
        //(false, s)
        let presigned_error (error_message, bytes_to_return: string * bytes): bool * storage =
            [%Michelson ({| { FAILWITH } |} : string * bytes -> bool * storage)] (error_message, bytes_to_return) 
        in presigned_error (("NO_PERMIT_SUBMIT_TIME", params_hash))
    else
        // checks for permit expiry
        let effective_expiry =
            match Big_map.find_opt (params.address_from, params_hash) s.permit_expiries with
            | None ->
                begin
                    match Big_map.find_opt params.address_from s.user_expiries with
                    | None -> (Some s.default_expiry)
                    | Some exp -> exp
                end
            | Some exp -> exp
        in
        match effective_expiry with
        | None -> (failwith "NO_EXPIRY_FOUND": (bool * storage))
        | Some effective_exp ->
            if abs (Tezos.now - permit_submit_time) >= effective_exp
            then
                (false, { s with permits = Big_map.remove (params.address_from, params_hash) s.permits })
            else
                (true, { s with permits = Big_map.remove (params.address_from, params_hash) s.permits })
