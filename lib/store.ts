import {create} from 'zustand';
interface State{progress:number;section:number;loaded:boolean;reduced:boolean;setProgress:(v:number)=>void;setSection:(v:number)=>void;setLoaded:(v:boolean)=>void;setReduced:(v:boolean)=>void}
export const useWorldStore=create<State>((set)=>({progress:0,section:0,loaded:false,reduced:false,setProgress:(progress)=>set({progress}),setSection:(section)=>set({section}),setLoaded:(loaded)=>set({loaded}),setReduced:(reduced)=>set({reduced})}));
