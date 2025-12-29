// 금칙어 목록
const FORBIDDEN_WORDS = ['캄보디아', '프놈펜', '불법체류', '텔레그램'];

// 금칙어 검사
export function containsForbiddenWords(text: string): boolean {
  return FORBIDDEN_WORDS.some(word => text.includes(word));
}

