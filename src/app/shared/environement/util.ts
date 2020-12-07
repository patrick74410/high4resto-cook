export class Util {
    public trackById(index: number, item: any) {
        return item ? item.id : null;
    }
    public trackByTableName(index: number, item: any) {
        return item ? item.tableName : null;
    }
    public trackByproductName(index: number, item: any) {
        return item ? item.productName : null;
    }
    public levenshtein(a: string, b: string): number
    {
    a=a.toLocaleUpperCase();
    b=b.toLocaleUpperCase();
	const an = a ? a.length : 0;
	const bn = b ? b.length : 0;
	if (an === 0)
	{
		return bn;
	}
	if (bn === 0)
	{
		return an;
	}
	const matrix = new Array<number[]>(bn + 1);
	for (let i = 0; i <= bn; ++i)
	{
		let row = matrix[i] = new Array<number>(an + 1);
		row[0] = i;
	}
	const firstRow = matrix[0];
	for (let j = 1; j <= an; ++j)
	{
		firstRow[j] = j;
	}
	for (let i = 1; i <= bn; ++i)
	{
		for (let j = 1; j <= an; ++j)
		{
			if (b.charAt(i - 1) === a.charAt(j - 1))
			{
				matrix[i][j] = matrix[i - 1][j - 1];
			}
			else
			{
				matrix[i][j] = Math.min(
					matrix[i - 1][j - 1],
					matrix[i][j - 1],
					matrix[i - 1][j]
				) + 1;
			}
		}
	}
	return matrix[bn][an];
    };
}