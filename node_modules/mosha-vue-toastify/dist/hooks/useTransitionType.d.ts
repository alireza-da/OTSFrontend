import { Position, TransitionType } from '../types';
import { ComputedRef, Ref } from 'vue';
declare const useTransitionType: (position: Position, transition: TransitionType, swiped: Ref<number>) => {
    transitionType: ComputedRef<string>;
};
export default useTransitionType;
