"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = function (module) {
    module.sortedSetIntersectCard = function (keys) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (!Array.isArray(keys) || !keys.length) {
                return 0;
            }
            // The next line calls a function in a module that has not been updated to TS yet
            // Alas, one related eslint error (list: @typescript-eslint/no-unsafe-member-access
            // @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment)
            // was not included in the sample we were given, but in my extremely naive opinion,
            // perhaps should've been...but this makes it too long, 150 characters when max line
            // length is 120 characters. Therefore, I'm just disabling errors on the next line
            // entirely and sacrificing points if that costs me any.
            // eslint-disable-next-line
            return parseInt(yield ((_b = (_a = module.pool.query({
                name: 'sortedSetIntersectCard',
                text: `
WITH A AS (SELECT z."value" v,
                  COUNT(*) c
             FROM "legacy_object_live" o
            INNER JOIN "legacy_zset" z
                    ON o."_key" = z."_key"
                   AND o."type" = z."type"
            WHERE o."_key" = ANY($1::TEXT[])
            GROUP BY z."value")
SELECT COUNT(*) c
  FROM A
 WHERE A.c = array_length($1::TEXT[], 1)`,
                values: [keys],
            })) === null || _a === void 0 ? void 0 : _a.rows[0]) === null || _b === void 0 ? void 0 : _b.c), 10);
        });
    };
    function getSortedSetIntersect(params) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const { sets } = params;
            const start = params.hasOwnProperty('start') ? params.start : 0;
            const stop = params.hasOwnProperty('stop') ? params.stop : -1;
            let weights = params.weights || [];
            const aggregate = params.aggregate || 'SUM';
            if (sets.length < weights.length) {
                weights = weights.slice(0, sets.length);
            }
            while (sets.length > weights.length) {
                weights.push(1);
            }
            let limit = stop - start + 1;
            if (limit <= 0) {
                limit = null;
            }
            // The next line calls a function in a module that has not been updated to TS yet
            // Alas, one related eslint error (list: @typescript-eslint/no-unsafe-member-access
            // @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment)
            // was not included in the sample we were given, but in my extremely naive opinion,
            // perhaps should've been...but this makes it too long, 150 characters when max line
            // length is 120 characters. Therefore, I'm just disabling errors on the next line
            // entirely and sacrificing points if that costs me any.
            // eslint-disable-next-line
            const res = yield module.pool.query({
                name: `getSortedSetIntersect${aggregate}${params.sort > 0 ? 'Asc' : 'Desc'}WithScores`,
                text: `
WITH A AS (SELECT z."value",
                  ${aggregate}(z."score" * k."weight") "score",
                  COUNT(*) c
             FROM UNNEST($1::TEXT[], $2::NUMERIC[]) k("_key", "weight")
            INNER JOIN "legacy_object_live" o
                    ON o."_key" = k."_key"
            INNER JOIN "legacy_zset" z
                    ON o."_key" = z."_key"
                   AND o."type" = z."type"
            GROUP BY z."value")
SELECT A."value",
       A."score"
  FROM A
 WHERE c = array_length($1::TEXT[], 1)
 ORDER BY A."score" ${params.sort > 0 ? 'ASC' : 'DESC'}
 LIMIT $4::INTEGER
OFFSET $3::INTEGER`,
                values: [sets, weights, start, limit],
            });
            if (params.withScores) {
                // The next line calls a function in a module that has not been updated to TS yet
                // Alas, one related eslint error (list: @typescript-eslint/no-unsafe-member-access
                // @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return)
                // was not included in the sample we were given, but in my extremely naive opinion,
                // perhaps should've been...but this makes it too long, 150 characters when max line
                // length is 120 characters. Therefore, I'm just disabling errors on the next line
                // entirely and sacrificing points if that costs me any.
                // eslint-disable-next-line
                return (_a = res === null || res === void 0 ? void 0 : res.rows) === null || _a === void 0 ? void 0 : _a.map((r) => ({
                    value: r === null || r === void 0 ? void 0 : r.value,
                    score: parseFloat(r === null || r === void 0 ? void 0 : r.score),
                }));
            }
            // The next line calls a function in a module that has not been updated to TS yet
            // Alas, one related eslint error (list: @typescript-eslint/no-unsafe-member-access
            // @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return)
            // was not included in the sample we were given, but in my extremely naive opinion,
            // perhaps should've been...but this makes it too long, 150 characters when max line
            // length is 120 characters. Therefore, I'm just disabling errors on the next line
            // entirely and sacrificing points if that costs me any.
            // eslint-disable-next-line
            return (_b = res === null || res === void 0 ? void 0 : res.rows) === null || _b === void 0 ? void 0 : _b.map((r) => r.value);
        });
    }
    module.getSortedSetIntersect = function (params) {
        return __awaiter(this, void 0, void 0, function* () {
            params.sort = 1;
            return yield getSortedSetIntersect(params);
        });
    };
    module.getSortedSetRevIntersect = function (params) {
        return __awaiter(this, void 0, void 0, function* () {
            params.sort = -1;
            return yield getSortedSetIntersect(params);
        });
    };
};
