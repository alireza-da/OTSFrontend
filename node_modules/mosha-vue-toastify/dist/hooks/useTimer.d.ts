import { Ref } from 'vue';
declare const useTimer: (callback: () => void | string, delay: number) => {
    start: () => void;
    stop: () => void;
    clear: () => void;
    progress: Ref<number>;
};
export default useTimer;
