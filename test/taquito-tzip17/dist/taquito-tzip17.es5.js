import { buf2hex } from "@taquito/utils";
import { blake2b } from "blakejs";
import { packDataBytes } from "@taquito/michel-codec";

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P
      ? value
      : new P(function (resolve) {
          resolve(value);
        });
  }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done
        ? resolve(result.value)
        : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}

function __generator(thisArg, body) {
  var _ = {
      label: 0,
      sent: function () {
        if (t[0] & 1) throw t[1];
        return t[1];
      },
      trys: [],
      ops: []
    },
    f,
    y,
    t,
    g;
  return (
    (g = { next: verb(0), throw: verb(1), return: verb(2) }),
    typeof Symbol === "function" &&
      (g[Symbol.iterator] = function () {
        return this;
      }),
    g
  );
  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");
    while (_)
      try {
        if (
          ((f = 1),
          y &&
            (t =
              op[0] & 2
                ? y["return"]
                : op[0]
                ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                : y.next) &&
            !(t = t.call(y, op[1])).done)
        )
          return t;
        if (((y = 0), t)) op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (
              !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
              (op[0] === 6 || op[0] === 2)
            ) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2]) _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    if (op[0] & 5) throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
}

function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o),
    r,
    ar = [],
    e;
  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  } catch (error) {
    e = { error: error };
  } finally {
    try {
      if (r && !r.done && (m = i["return"])) m.call(i);
    } finally {
      if (e) throw e.error;
    }
  }
  return ar;
}

function __spreadArray(to, from) {
  for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
    to[j] = from[i];
  return to;
}

var sigParamData = function (chainId, contractAddress, counter, methodHash) {
  return {
    prim: "Pair",
    args: [
      {
        prim: "Pair",
        args: [
          {
            string: chainId
          },
          {
            string: contractAddress
          }
        ]
      },
      {
        prim: "Pair",
        args: [
          {
            int: counter
          },
          {
            bytes: methodHash
          }
        ]
      }
    ]
  };
};
var sigParamType = {
  prim: "pair",
  args: [
    {
      prim: "pair",
      args: [
        {
          prim: "chain_id"
        },
        { prim: "address" }
      ]
    },
    {
      prim: "pair",
      args: [{ prim: "nat" }, { prim: "bytes" }]
    }
  ]
};
var ContractMethodTzip17 = /** @class */ (function () {
  function ContractMethodTzip17(
    context,
    contractAbs,
    method,
    parameterType,
    args
  ) {
    this.context = context;
    this.contractAbs = contractAbs;
    this.method = method;
    this.parameterType = parameterType;
    this.args = args;
  }
  ContractMethodTzip17.prototype.createPermit = function () {
    return __awaiter(this, void 0, void 0, function () {
      var methodHash, packedData, signature, publicKey;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.prepareMethodHash()];
          case 1:
            methodHash = _a.sent();
            return [4 /*yield*/, this.packData(methodHash)];
          case 2:
            packedData = _a.sent();
            return [4 /*yield*/, this.context.signer.sign(packedData.bytes)];
          case 3:
            signature = _a.sent();
            return [4 /*yield*/, this.context.signer.publicKey()];
          case 4:
            publicKey = _a.sent();
            return [
              2 /*return*/,
              {
                publicKey: publicKey,
                signature: signature.sig,
                methodHash: methodHash
              }
            ];
        }
      });
    });
  };
  ContractMethodTzip17.prototype.createTransferParam = function () {
    var _a;
    return (_a = this.method
      .apply(this, __spreadArray([], __read(this.args)))
      .toTransferParams().parameter) === null || _a === void 0
      ? void 0
      : _a.value;
  };
  ContractMethodTzip17.prototype.packTransfeerParam = function () {
    return __awaiter(this, void 0, void 0, function () {
      var rawPacked;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.context.packer.packData({
                data: this.createTransferParam(),
                type: this.parameterType
              })
            ];
          case 1:
            rawPacked = _a.sent();
            return [2 /*return*/, rawPacked.packed];
        }
      });
    });
  };
  ContractMethodTzip17.prototype.prepareMethodHash = function () {
    return __awaiter(this, void 0, void 0, function () {
      var packedParam;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.packTransfeerParam()];
          case 1:
            packedParam = _a.sent();
            return [2 /*return*/, buf2hex(Buffer.from(blake2b(packedParam)))];
        }
      });
    });
  };
  ContractMethodTzip17.prototype.packData = function (methodHash) {
    return __awaiter(this, void 0, void 0, function () {
      var chainId, contractStorage, counter;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.context.rpc.getChainId()];
          case 1:
            chainId = _a.sent();
            return [4 /*yield*/, this.contractAbs.storage()];
          case 2:
            contractStorage = _a.sent();
            counter = contractStorage.counter;
            return [
              2 /*return*/,
              packDataBytes(
                sigParamData(
                  chainId,
                  this.contractAbs.address,
                  counter,
                  methodHash
                ),
                sigParamType
              )
            ];
        }
      });
    });
  };
  return ContractMethodTzip17;
})();
var Tzip17ContractAbstraction = /** @class */ (function () {
  function Tzip17ContractAbstraction(contractAbstraction, context) {
    var _this = this;
    this.contractAbstraction = contractAbstraction;
    this.context = context;
    this.methods = {};
    var _loop_1 = function (method) {
      var methodFx = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        return new ContractMethodTzip17(
          context,
          _this.contractAbstraction,
          _this.contractAbstraction.methods[method],
          _this.contractAbstraction.entrypoints.entrypoints[method],
          args
        );
      };
      this_1.methods[method] = methodFx;
    };
    var this_1 = this;
    for (var method in this.contractAbstraction.methods) {
      _loop_1(method);
    }
  }
  return Tzip17ContractAbstraction;
})();

export { Tzip17ContractAbstraction };
//# sourceMappingURL=taquito-tzip17.es5.js.map
