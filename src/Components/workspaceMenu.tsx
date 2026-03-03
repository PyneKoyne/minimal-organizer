import type {WorkspaceMenuProps} from "../types.tsx";
import {DataContext, WorkspaceContext} from "../ContextProvider.tsx";
import {useContext} from "react";
import {RenamingStatus} from "../constants.tsx";

const WorkspaceMenu = ({workspaceMenuOpen, setWorkspaceMenuOpen}: WorkspaceMenuProps) => {
    const {workspaceData, dispatch} = useContext(DataContext)!;
    const data = workspaceData.values;
    const workspaceProperties = workspaceData.head;
    const workspaceIndex = workspaceData.index;
    const {renaming, setRenaming, tempName, setTempName} = useContext(WorkspaceContext)!;
    const currentWorkspace = workspaceProperties[workspaceIndex].key;

    return (
        <div className="workspace_menu" tabIndex={1}>
            {workspaceMenuOpen && <div
                className="overflow-auto rounded-r-2xl fixed px-8 py-12 left-0 top-0 h-screen w-3/12  bg-slate-400/30 backdrop-blur-md transition-all duration-400">
                <h1 className="mb-10 font-bold text-4xl text-slate-300">Workspaces</h1>
                {workspaceProperties.map(({key}, index) => {
                    return (
                        <button key={"workspace_button_" + key} tabIndex={0}
                             className="flex items-center justify-between w-10/12 my-4 p-3.5 rounded-lg bg-slate-900 hover:ring-2 hover:ring-green-200 cursor-pointer"
                             onClick={() => {
                                 dispatch({type:"SET_WORKSPACE_INDEX", workspaceIndex: index});
                             }}>
                            <button onClick={(e) => {
                                e.stopPropagation()
                                setRenaming(RenamingStatus.NotRenaming)
                                setTempName("")
                                dispatch({ type: "DELETE_WORKSPACE", workspaceIndex: index })
                            }} className="material-symbols-outlined text-slate-300 hover:text-indigo-400 cursor-pointer"><span>delete</span></button>
                            {renaming === RenamingStatus.MenuRenaming && currentWorkspace === key ? <input autoFocus defaultValue={tempName} onChange={(e) => {
                                    const newName = e.target.value;
                                    setTempName(newName)
                                }} className="text-md font-semibold text-slate-300 bg-transparent border-b border-slate-300 focus:outline-none focus:border-indigo-400"/>
                                :
                                <h2 onDoubleClick={() => {
                                    setRenaming(RenamingStatus.MenuRenaming);
                                    setTempName(key)
                                }} className="text-md font-semibold text-slate-300">{key}</h2> }
                            { currentWorkspace === key ?
                                <span className="material-symbols-outlined text-slate-300">chevron_left</span> :
                                <span className="material-symbols-outlined text-slate-300 opacity-0">chevron_left</span>
                            }
                        </button>
                    )
                })}
                <button onClick={() => {
                    let num = data.size;
                    while (data.has("workspace" + num.toString())) num++
                    setRenaming(RenamingStatus.NotRenaming)
                    setTempName("")
                    dispatch({ type: "ADD_WORKSPACE", newWorkspaceName: "workspace" + num.toString(), showTitle: true})
                }} className="w-full mt-8 max-w-10/12 inline-block px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-900 hover:ring-2 hover:ring-green-200 text-slate-900 dark:text-white cursor-pointer">+ New Workspace</button>
                <div className="absolute top-0 right-4 w-2/12 h-screen flex items-center">
                    <button onClick={() => setWorkspaceMenuOpen(false)}
                            className="z-20 right-0 absolute inline-block max-h-10 mx-2 my-6 p-2 rounded-lg bg-slate-200 dark:bg-slate-900 text-slate-900 dark:text-white hover:ring-2 hover:ring-green-200 cursor-pointer">
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                </div>
            </div>}
        </div>
    )
}

export default WorkspaceMenu;