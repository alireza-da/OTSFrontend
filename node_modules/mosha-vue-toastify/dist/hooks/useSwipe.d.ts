import { CSSProperties, Ref } from 'vue';
import { Position } from '../types';
declare const useSwipe: (position: Position, onCloseHandler: () => void, swipeClose: boolean) => {
    swipedDiff: Ref<number | undefined>;
    swipeStart: Ref<MouseEvent | TouchEvent | undefined>;
    swipeStyle: Ref<CSSProperties | undefined>;
    swipeHandler: (event: MouseEvent | TouchEvent) => void;
    startSwipeHandler: (event: MouseEvent | TouchEvent) => void;
    cleanUpMove: (move: 'mousemove' | 'touchmove') => void;
};
export default useSwipe;
