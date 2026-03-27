export const RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];

export function getNumberColor(num: number): 'red' | 'black' | 'green' {
  if (num === 0 || num === -1) return 'green';
  return RED_NUMBERS.includes(num) ? 'red' : 'black';
}

export function getNumberBgClass(num: number): string {
  const color = getNumberColor(num);
  if (color === 'green') return 'bg-green-600 text-white';
  if (color === 'red') return 'bg-red-600 text-white';
  return 'bg-zinc-900 text-white';
}

export function formatRouletteNumber(num: number): string {
  return num === -1 ? '00' : String(num);
}
