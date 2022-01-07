type transfer =
  [@layout:comb]
  { [@annot:from] address_from : address;
    [@annot:to] address_to : address;
    value : nat }

type approve =
  [@layout:comb]
  { spender : address;
    value : nat }

type allowance_key =
  [@layout:comb]
  { owner : address;
    spender : address }

type getAllowance =
  [@layout:comb]
  { request : allowance_key;
    callback : nat contract }

type getBalance =
  [@layout:comb]
  { owner : address;
    callback : nat contract }

type getTotalSupply =
  [@layout:comb]
  { request : unit ;
    callback : nat contract }

type balances = (address, nat) big_map
type allowances = (allowance_key, nat) big_map

// Permit types
type seconds = nat

type permits = ((address * bytes), timestamp) big_map
type user_expiries = (address, seconds option) big_map
type permit_expiries = ((address * bytes), seconds option) big_map

type default_expiry = seconds
type counter = nat

type permit_params = (key * (signature * bytes))
type expiry_params = (address * (seconds * (bytes option)))

type storage = {
  balances : balances;
  allowances : allowances;
  total_supply : nat;
  counter: nat;
  default_expiry: seconds;
  permits: permits;
  user_expiries: user_expiries;
  permit_expiries: permit_expiries;
  max_expiry: seconds;
  metadata: (string, bytes) big_map;
  token_metadata: (string, bytes) big_map;
  admin: address;
}

#include "./permit.mligo"

type parameter =
  | Transfer of transfer
  | Approve of approve
  | Mint of address * nat
  | GetAllowance of getAllowance
  | GetBalance of getBalance
  | GetTotalSupply of getTotalSupply
  | Permit of permit_params list
  | SetExpiry of expiry_params

type result = operation list * storage

[@inline]
let positive (n : nat) : nat option =
  if n = 0n
  then (None : nat option)
  else Some n

let transfer (param, storage : transfer * storage) : result =
  let (is_transfer_authorized, new_storage) = transfer_presigned (param, storage) in
  let allowances = new_storage.allowances in
  let balances = new_storage.balances in
  let allowances =
    if Tezos.sender = param.address_from || is_transfer_authorized
    then allowances
    else
      let allowance_key = { owner = param.address_from ; spender = Tezos.sender } in
      let authorized_value =
        match Big_map.find_opt allowance_key allowances with
        | Some value -> value
        | None -> 0n in
      let authorized_value =
        match is_nat (authorized_value - param.value) with
        | None -> 
          //(failwith "NotEnoughAllowance" : nat)
          let params_hash = Crypto.blake2b (Bytes.pack param) in
          let presigned_error (error_message, bytes_to_return: string * bytes): nat =
            [%Michelson ({| { FAILWITH } |} : string * bytes -> nat)] (error_message, bytes_to_return) 
          in presigned_error (("NotEnoughAllowance", params_hash))
        | Some authorized_value -> authorized_value in
      Big_map.update allowance_key (positive authorized_value) allowances in
  let balances =
    let from_balance =
      match Big_map.find_opt param.address_from balances with
      | Some value -> value
      | None -> 0n in
    let from_balance =
      match is_nat (from_balance - param.value) with
      | None -> (failwith "NotEnoughBalance" : nat)
      | Some from_balance -> from_balance in
    Big_map.update param.address_from (positive from_balance) balances in
  let balances =
    let to_balance =
      match Big_map.find_opt param.address_to balances with
      | Some value -> value
      | None -> 0n in
    let to_balance = to_balance + param.value in
    Big_map.update param.address_to (positive to_balance) balances in
(([] : operation list), { new_storage with balances = balances; allowances = allowances })

let approve (param, storage : approve * storage) : result =
  let allowances = storage.allowances in
  let allowance_key = { owner = Tezos.sender ; spender = param.spender } in
  let previous_value =
    match Big_map.find_opt allowance_key allowances with
    | Some value -> value
    | None -> 0n in
  begin
    if previous_value > 0n && param.value > 0n
    then (failwith "UnsafeAllowanceChange")
    else ();
    let allowances = Big_map.update allowance_key (positive param.value) allowances in
    (([] : operation list), { storage with allowances = allowances })
  end

let mint (param, storage : (address * nat) * storage) : result =
  if Tezos.sender <> storage.admin
  then (failwith "UNAUTHORIZED_MINTING")
  else
    let (recipient, tokens) = param in
    
    ([] : operation list),
    {
      storage with
        balances = Big_map.update recipient (Some tokens) storage.balances;
        total_supply = storage.total_supply + tokens
    }

let getAllowance (param, storage : getAllowance * storage) : operation list =
  let value =
    match Big_map.find_opt param.request storage.allowances with
    | Some value -> value
    | None -> 0n in
  [Tezos.transaction value 0mutez param.callback]

let getBalance (param, storage : getBalance * storage) : operation list =
  let value =
    match Big_map.find_opt param.owner storage.balances with
    | Some value -> value
    | None -> 0n in
  [Tezos.transaction value 0mutez param.callback]

let getTotalSupply (param, storage : getTotalSupply * storage) : operation list =
  let total = storage.total_supply in
  [Tezos.transaction total 0mutez param.callback]

let main (param, storage : parameter * storage) : result =
  begin
    if Tezos.amount <> 0mutez
    then failwith "DontSendTez"
    else ();
    match param with
    | Transfer param -> transfer (param, storage)
    | Approve param -> approve (param, storage)
    | Mint param -> mint (param, storage)
    | GetAllowance param -> (getAllowance (param, storage), storage)
    | GetBalance param -> (getBalance (param, storage), storage)
    | GetTotalSupply param -> (getTotalSupply (param, storage), storage)
    | Permit param -> permit (param, storage)
    | SetExpiry param -> set_expiry (param, storage)
  end
