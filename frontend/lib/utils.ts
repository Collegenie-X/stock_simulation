import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 클래스명 병합 유틸리티 함수
 * clsx와 tailwind-merge를 결합하여 Tailwind CSS 클래스를 안전하게 병합합니다.
 * 
 * @param inputs - 병합할 클래스명들
 * @returns 병합된 클래스명 문자열
 * 
 * @example
 * cn("px-2 py-1", "px-4") // "py-1 px-4" (px-2가 px-4로 덮어씌워짐)
 * cn("text-red-500", condition && "text-blue-500") // 조건부 클래스 적용
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

