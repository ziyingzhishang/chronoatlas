export type TimeNavigationMode = 'bar' | 'analysis';
export type TimelineAnnotationLayer = 'none' | 'events' | 'changes';

export interface TimeNavigationState {
  mode: TimeNavigationMode;
  annotationLayer: TimelineAnnotationLayer;
}

export type TimeNavigationAction =
  | { type: 'open-analysis' }
  | { type: 'close-analysis' }
  | { type: 'show-none' }
  | { type: 'show-events' }
  | { type: 'show-changes' };

export const initialTimeNavigationState: TimeNavigationState = {
  mode: 'bar',
  annotationLayer: 'none',
};

export function timeNavigationReducer(
  state: TimeNavigationState,
  action: TimeNavigationAction,
): TimeNavigationState {
  switch (action.type) {
    case 'open-analysis':
      return state.mode === 'analysis' ? state : { ...state, mode: 'analysis' };
    case 'close-analysis':
      return state.mode === 'bar' ? state : { ...state, mode: 'bar' };
    case 'show-none':
      return state.annotationLayer === 'none' ? state : { ...state, annotationLayer: 'none' };
    case 'show-events':
      return state.annotationLayer === 'events' ? state : { ...state, annotationLayer: 'events' };
    case 'show-changes':
      return state.annotationLayer === 'changes' ? state : { ...state, annotationLayer: 'changes' };
  }
}
