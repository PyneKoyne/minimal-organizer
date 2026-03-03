import * as React from 'react'
import {useCallback, useEffect, useLayoutEffect, useReducer, useState} from 'react'
import Workspace from "./Components/workspace.tsx";
import {useXarrow} from "react-xarrows"
import WorkspaceMenu from "./Components/workspaceMenu.tsx";
import {type CardItem, type DataReducer, type WorkingData, type WorkspaceData} from "./types.tsx";
import {DataContext, WorkspaceContext} from "./ContextProvider.tsx";
import {RenamingStatus} from "./constants.tsx";

const BASE_CARD: CardItem = {
    title: "Fried and Fried Again",
    tech: "Javascript, React, Tailwind",
    comments: "- Hi\n- This is a comment\n- And another one",
    caption: "This is a caption"
}

const BASE_PROJECT: WorkingData = {
    index: 0,
    head: [{key: "workspace", title: true}],
    values: new Map<string, CardItem[]>([["workspace", [BASE_CARD]]])
}

const sanitizeHeader = (data: Map<string, CardItem[]>, workspaces: WorkspaceData[]) => {
    if (data.size !== workspaces.length || !data.has(workspaces[0].key) || workspaces.length == 0) {
        const temp_workspaces: WorkspaceData[] = []
        const data_keys = data.keys();
        for (let i = 0; i < data.size; i++) {
            const next_key = data_keys.next().value
            temp_workspaces.push({key: next_key ? next_key : "workspace", title: true})
        }
        return temp_workspaces
    }
    return workspaces
}

const dataReducer = (state: WorkingData, action: DataReducer): WorkingData => {
    console.log(state)
    const showTitle = action.showTitle ? action.showTitle : false;
    const workspaceIndex = action.workspaceIndex ? action.workspaceIndex : 0;
    if (workspaceIndex < 0 || workspaceIndex >= state.head.length) {
        console.log("workspaceIndex Out Of Bounds")
        console.log(workspaceIndex)
        console.log(state.head)
        return state;
    }
    const workspaceName = state.head[workspaceIndex].key;

    switch (action.type) {
        case "UPDATE":
            if (action.workspaceIndex !== undefined && action.id !== undefined) {
                const workspace = state.values.get(workspaceName);
                if (workspace && workspace.length > 0) {
                    const newWorkspaceValues = new Map(state.values);
                    newWorkspaceValues.set(workspaceName, [...workspace]);
                    newWorkspaceValues.get(workspaceName)![action.id] = action.card ? action.card : BASE_CARD;
                    return {index: state.index, head: state.head, values: newWorkspaceValues};
                }
            }
            return state;

        case "ADD_CARD":
            if (action.workspaceIndex !== undefined) {
                const workspace = state.values.get(workspaceName);
                if (workspace) {
                    const newWorkspaceValues = new Map(state.values);
                    newWorkspaceValues.set(workspaceName, [...workspace, action.card ? action.card : BASE_CARD]);
                    return {index: state.index, head: state.head, values: newWorkspaceValues};
                }
            }
            return state;

        case "DELETE_CARD":
            if (action.workspaceIndex !== undefined&& action.id !== undefined) {
                const workspace = state.values.get(workspaceName);
                if (workspace && workspace.length > 0) {
                    const newWorkspaceValues = new Map(state.values);
                    const newWorkspace = [...workspace];
                    newWorkspace.splice(action.id, 1);
                    newWorkspaceValues.set(workspaceName, newWorkspace);
                    return {index: state.index, head: state.head, values: newWorkspaceValues};
                }
            }
            return state;

        case "LOAD":
            if (action.workspaceIndex !== undefined) {
                const newWorkspaceValues = new Map(state.values);
                newWorkspaceValues.set(workspaceName, action.workspace ? action.workspace : [BASE_CARD]);
                return {index: state.index, head: state.head, values: newWorkspaceValues};
            }
            return state;

        case "BOOT": {
            const boot_project = action.project ? action.project : BASE_PROJECT;
            boot_project.head = sanitizeHeader(boot_project.values, boot_project.head)
            return boot_project;
        }

        case "ADD_WORKSPACE": {
            const newWorkspaceValues = new Map(state.values);
            const newWorkspaceName = action.newWorkspaceName ? action.newWorkspaceName : "workspace"
            let newHead = [...state.head]
            newWorkspaceValues.set(newWorkspaceName, action.workspace ? action.workspace : [BASE_CARD]);
            console.log(showTitle)
            newHead.push({key: newWorkspaceName, title: showTitle})
            newHead = sanitizeHeader(newWorkspaceValues, newHead)
            return {index: newHead.length - 1, head: newHead, values: newWorkspaceValues};
        }

        case "RENAME_WORKSPACE":
            if (action.workspaceIndex !== undefined && action.newWorkspaceName) {
                const workspace = state.values.get(workspaceName);
                console.log(workspace)
                if (workspace) {
                    const newWorkspaceValues = new Map(state.values);
                    const newHead = [...state.head]
                    newWorkspaceValues.delete(workspaceName);
                    newWorkspaceValues.set(action.newWorkspaceName, workspace);
                    console.log(newWorkspaceValues)
                    newHead[workspaceIndex] = {key: action.newWorkspaceName, title: state.head[workspaceIndex].title}
                    return {index: workspaceIndex, head: newHead, values: newWorkspaceValues};
                }
            }
            return state;

        case "CLEAR":
            if (action.workspaceIndex !== undefined) {
                const newWorkspaceValues = new Map(state.values);
                newWorkspaceValues.set(workspaceName, [BASE_CARD]);
                return {index: state.index, head: state.head, values: newWorkspaceValues};
            }
            return state;

        case "DELETE_WORKSPACE":
            if (action.workspaceIndex !== undefined) {
                const newWorkspaceValues = new Map(state.values);
                let new_head = [...state.head]
                newWorkspaceValues.delete(workspaceName);
                new_head.splice(workspaceIndex, 1)
                if (newWorkspaceValues.size == 0) {
                    newWorkspaceValues.set("workspace", [BASE_CARD]);
                    new_head.push({key: "workspace", title: showTitle})
                }
                new_head = sanitizeHeader(newWorkspaceValues, new_head)
                const new_index = state.index === workspaceIndex || state.index >= new_head.length ? 0 : state.index
                return {index: new_index, head: new_head, values: newWorkspaceValues};
            }
            return state;

        case "SET_WORKSPACE_INDEX":
            if (action.workspaceIndex !== undefined){
                return {index: workspaceIndex, head:state.head, values: state.values}
            }
            return state;

        case "TOGGLE_TITLE":
            if (action.workspaceIndex !== undefined) {
                const newHead = [...state.head]
                newHead[workspaceIndex] = {key: workspaceName, title: !state.head[workspaceIndex].title}
                return {index: state.index, head: newHead, values: state.values};
            }
            return state;

        default:
            return state;
    }
};

function replacer(_key: string, value: Map<string, CardItem[]>) {
    if(value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
        };
    } else {
        return value;
    }
}

function reviver(_key: string, value: any): any {
    if(typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
    }
    return value;
}


function App() {
    const [currentCard, changeCurrentCard] = useState<number>(-1)
    const [renaming, setRenaming] = useState<typeof RenamingStatus[keyof typeof RenamingStatus]>(RenamingStatus.NotRenaming);
    const [tempName, setTempName] = useState<string>("")
    const [shiftPressed, setShiftPressed] = useState<boolean>(false);
    const [workspaceData, dispatch] = useReducer(dataReducer, BASE_PROJECT);
    const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState<boolean>(false);
    const updateXarrow = useXarrow();
    const data = workspaceData.values;
    const workspaceIndex = workspaceData.index;
    const workspaceProperties = workspaceData.head;
    const currentWorkspace = workspaceProperties[workspaceIndex] ? workspaceProperties[workspaceIndex].key : "workspace"

    // const setCurrentWorkspace = (index: number) => {
    //     changeCurrentCard(-1);
    //     if (renaming) setName()
    //     dispatch({type: "SET_WORKSPACE_INDEX", workspaceIndex: index});
    // }

    const setName = () => {
        const workspaceData = data.get(currentWorkspace);
        if (workspaceData) {
            let num = 0;
            while (data.has(tempName + (num === 0 ? "" : num.toString())) && tempName + (num === 0 ? "" : num.toString()) !== currentWorkspace) num++
            dispatch({type: "RENAME_WORKSPACE", newWorkspaceName: tempName + (num === 0 ? "" : num.toString()), workspaceIndex: workspaceIndex});
        }
        setTempName("");
        setRenaming(RenamingStatus.NotRenaming)
    }

    const handleKeyUp = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Shift') {
            setShiftPressed(false)
        }
    }, []);

    useEffect(() => {
        const tempData: string | null = localStorage.getItem("data")
        const tempWorkspaces: string | null = localStorage.getItem("workspaces")
        const lastKey: string | null = localStorage.getItem("last_key")
        if (tempData) {
            try {
                const jsonData = JSON.parse(tempData, reviver) as Map<string, CardItem[]>;
                const parsed_key: number | string = lastKey ? JSON.parse(lastKey) : 0;
                let key = 0;

                if (typeof parsed_key == "number") {
                    key = parsed_key
                }

                if (tempWorkspaces) {
                    const jsonWorkspaces = JSON.parse(tempWorkspaces) as WorkspaceData[];
                    dispatch({type: "BOOT", project: {index: key, head: sanitizeHeader(jsonData, jsonWorkspaces), values: jsonData}})
                }
                else {
                    dispatch({type: "BOOT", project: {index: key, head: sanitizeHeader(jsonData, []), values: jsonData}})
                }
                console.log('Loaded Workspace data from localStorage:', jsonData);
                console.log('Loaded Workspace header from localStorage:', tempWorkspaces);
            }
            catch (error) {
                console.error('Error parsing JSON from localStorage:', error);
            }
        }
    }, []);

    useEffect(() => {
        const onBeforeUnload = (e: BeforeUnloadEvent) => {

            localStorage.setItem("data", JSON.stringify(data, replacer))
            localStorage.setItem("last_key", JSON.stringify(workspaceIndex))
            localStorage.setItem("workspaces", JSON.stringify(workspaceProperties))

            console.log('Saved JSON data to localStorage:', data);

            console.log(e.target)

            if (renaming) {
                e.preventDefault(); // Would stop user
            }
            return "Anything here as well, doesn't matter!";
        };

        window.addEventListener("beforeunload", onBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", onBeforeUnload);
        };
    }, [data, renaming, workspaceIndex, workspaceProperties]);

    useEffect(() => {
        const  handleKeyDown = (event: KeyboardEvent) => {
            console.log('Global key press:', event.key);
            // You can check for specific keys, e.g., for accessibility shortcuts
            if (event.key === 'Shift') {
                setShiftPressed(true)
            }
            if (!shiftPressed && event.key === 'Enter') {
                changeCurrentCard(-1)
                if (renaming) setName()
            }
        };

        // Add the event listener when the component mounts
        document.addEventListener('keydown', handleKeyDown as EventListener);

        // Remove the event listener when the component unmounts (cleanup)
        return () => {
            document.removeEventListener('keydown', handleKeyDown as EventListener);
        };
    }, [shiftPressed, renaming, tempName]); // Re-run effect if handleKeyDown changes

    useEffect(() => {
        // Add the event listener when the component mounts
        document.addEventListener('keyup', handleKeyUp as EventListener);

        // Remove the event listener when the component unmounts (cleanup)
        return () => {
            document.removeEventListener('keyup', handleKeyUp as EventListener);
        };
    }, [handleKeyUp]); // Re-run effect if handleKeyUp changes

    const checkClick = (e: MouseEvent) => {
        // `e.target` is of type EventTarget which doesn't have `closest` directly, cast to HTMLElement when possible
        const target = e.target as HTMLElement | null
        if (!target) { changeCurrentCard(-1); return }

        const currentWorkspaceData = data.get(currentWorkspace);
        if (!currentWorkspaceData) { changeCurrentCard(-1); return }

        for (let i = 0; i < currentWorkspaceData.length; i++) {
            if (target.closest(".card" + i.toString())) {
                if (currentCard !== i) changeCurrentCard(i)
                return
            }
        }
        changeCurrentCard(-1)

        if (target.closest(".workspace_menu")) return;
        if (target.closest(".title_container")) return;

        if (renaming !== RenamingStatus.NotRenaming) {
            setName();
        }
    }

    const uploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        changeCurrentCard(-2)
        const file = e.target.files && e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event: ProgressEvent<FileReader>) => {
                const fileContent = event.target?.result;
                console.log('File content:', fileContent);
                if (typeof fileContent === 'string') {
                    try {
                        const jsonData = JSON.parse(fileContent) as CardItem[];
                        dispatch({ type: "LOAD", workspaceIndex: workspaceIndex, workspace: jsonData })
                        console.log('Parsed JSON data:', jsonData);
                    } catch (error) {
                        console.error('Error parsing JSON:', error);
                    }
                }
            };
            reader.readAsText(file);
        }
    }

    const saveContext = () => {
        const blob = new Blob([JSON.stringify(data.get(currentWorkspace))], { type: 'text/plain' }); // Specify the file's MIME type
        const url = URL.createObjectURL(blob); // Create a URL for the Blob

        console.log('Saving data:', data); // Log the data being saved

        // Create a temporary anchor element to trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'minimal-organizer-save.txt'; // Set the desired file name
        document.body.appendChild(a); // Append the anchor to the document
        a.click(); // Trigger the download
        document.body.removeChild(a); // Clean up by removing the anchor
        URL.revokeObjectURL(url); // Release the object URL
    }

    // Ensure arrows update whenever the data (and thus DOM nodes) change.
    useLayoutEffect(() => {
        // useLayoutEffect runs after DOM mutations but before paint — good for measuring/updating
        try {
            updateXarrow();
            // Also schedule another update on next animation frame to ensure DOM is painted
            // and the arrow library can measure elements correctly.
            requestAnimationFrame(() => {
                try { updateXarrow(); } catch (e ) { console.warn('updateXarrow failed on animation frame', e); }
            });
        } catch (e) {
            // swallow if updateXarrow isn't ready yet
            console.warn('updateXarrow failed', e);
        }
    }, [data, currentCard]);

    return (
        <>
            <div onClick={(e) => checkClick(e as unknown as MouseEvent)}
                 className=" max-h-screen bg-transparent">
                <DataContext.Provider value={{ workspaceData, dispatch }}>
                    <WorkspaceContext.Provider value={{ renaming, setRenaming, tempName, setTempName}}>
                    {!workspaceMenuOpen && <div tabIndex={0}
                        className="fixed left-0 top-0 h-screen w-50 flex items-center align-middle justify-items-center justify-center bg-linear-to-r from-green-200/25 to-slate-900/0 transition-all opacity-0 hover:opacity-100 focus-within:opacity-100 duration-400">
                        <button onClick={() => setWorkspaceMenuOpen(true)}
                                className="z-20 absolute left-2/12 inline-block max-h-10 mx-2 my-6 p-2 rounded-lg bg-slate-200 dark:bg-slate-900 text-slate-900 dark:text-white hover:ring-2 hover:ring-green-200 cursor-pointer">
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>}
                    <Workspace changeCurrentCard={changeCurrentCard} currentCard={currentCard}/>
                    <div className="fixed right-6 top-0 flex align-middle items-center">
                        <form method="post" encType="multipart/form-data">
                            <div className="flex">
                                <label htmlFor="json_upload"
                                       className="mx-2 my-6 inline-block px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-900 hover:ring-2 hover:ring-green-200 text-slate-900 dark:text-white cursor-pointer">Upload</label>
                                <input type="file" id="json_upload" name="json_upload" accept=".txt" onChange={(e) => uploadFile(e)}
                                       className="size-0 opacity-0"/>
                            </div>
                        </form>
                        <button onClick={() => saveContext()} className="inline-block mx-2 my-6 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-900 hover:ring-2 hover:ring-green-200 text-slate-900 dark:text-white cursor-pointer">Export</button>
                    </div>
                    <div className="fixed left-6 top-0 flex align-middle items-center">
                        <button onClick={() => dispatch({type: "CLEAR", workspaceIndex: workspaceIndex})} className="inline-block mx-2 my-6 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-900 hover:ring-2 hover:ring-green-200 text-slate-900 dark:text-white cursor-pointer">Clear</button>
                        <button onClick={() => dispatch({type: "TOGGLE_TITLE", workspaceIndex: workspaceIndex})} className="inline-block mx-2 my-6 px-4 py-2 max-h-10 rounded-lg bg-slate-200 dark:bg-slate-900 hover:ring-2 hover:ring-green-200 text-slate-900 dark:text-white cursor-pointer"><span className="material-symbols-outlined">edit</span></button>
                    </div>
                    <WorkspaceMenu workspaceMenuOpen={workspaceMenuOpen} setWorkspaceMenuOpen={setWorkspaceMenuOpen}/>
                    </WorkspaceContext.Provider>
                </DataContext.Provider>
            </div>
        </>
    )
}

export default App
