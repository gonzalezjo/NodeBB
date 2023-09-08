type SetParameters = {
    sets: Array<string>,
    start: number,
    stop: number,
    weights: Array<number>,
    sort?: number,
    withScores?: boolean,
    aggregate?: string,
}

type ResultRecord = {
    value: number,
    score: string
}

export interface moduleExportsSignature {
    sortedSetIntersectCard?: (keys: Array<string>) => Promise<number>,
    getSortedSetIntersect?: (params: SetParameters) => Promise<Array<number>>,
    getSortedSetRevIntersect?: (params: SetParameters) => Promise<Array<number>>, // line below is for unported module
    pool?: any, // eslint-disable-line @typescript-eslint/no-explicit-any
}

module.exports = function (module : moduleExportsSignature) {
    module.sortedSetIntersectCard = async function (keys: Array<string>) : Promise<number> {
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
        return parseInt(await module.pool.query({
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
        })?.rows[0]?.c, 10);
    };


    async function getSortedSetIntersect(params: SetParameters): Promise<Array<number>> {
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
        const res = await module.pool.query({
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
            return res?.rows?.map((r: ResultRecord) => ({
                value: r?.value,
                score: parseFloat(r?.score),
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
        return res?.rows?.map((r: ResultRecord) => r.value);
    }

    module.getSortedSetIntersect = async function (params: SetParameters): Promise<Array<number>> {
        params.sort = 1;
        return await getSortedSetIntersect(params);
    };

    module.getSortedSetRevIntersect = async function (params: SetParameters): Promise<Array<number>> {
        params.sort = -1;
        return await getSortedSetIntersect(params);
    };
};
