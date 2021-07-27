import { ComputedRef, CSSProperties } from 'vue';
import { Position } from '../types';
declare const useCustomStyle: (position: Position, offset: number, bgColor: string) => {
    customStyle: ComputedRef<CSSProperties>;
};
export default useCustomStyle;
