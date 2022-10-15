export function pickRandomElem(arr: any[] = []): any {
    return arr[Math.floor(Math.random() * arr.length)];
}
