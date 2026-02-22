import {useCallback, useEffect, useLayoutEffect, useReducer, useState} from 'react'
import Workspace from "./Components/workspace.tsx";
import {useXarrow} from "react-xarrows"
import * as React from "react";

// Reuse CardItem type shape from Card component
interface CardItem {
    title: string
    tech: string
    comments: string
    caption: string
}

interface DataReducer {
    type: "UPDATE" | "ADD_CARD" | "DELETE_CARD" | "LOAD" | "ADD_WORKSPACE" | "CLEAR" | "BOOT" | "DELETE_WORKSPACE";
    workspaceIndex?: string;
    id?: number;
    card?: CardItem;
    workspace?: CardItem[];
    project?: Map<string, CardItem[]>;
}

const BASE_CARD: CardItem = {
    title: "A Stupid Drone",
    tech: "Javascript, React, Tailwind",
    comments: "- Hi\n- This is a comment\n- And another one",
    caption: "A ESP32 drone that is really stupid and can't do anything, but it's still pretty cool"
}

const reducer = (state: Map<string, CardItem[]>, action: DataReducer): Map<string, CardItem[]> => {
    switch (action.type) {
        case "UPDATE":
            if (action.workspaceIndex && action.id !== undefined) {
                const workspace = state.get(action.workspaceIndex);
                if (workspace && workspace.length > 0) {
                    const newState = new Map(state);
                    newState.set(action.workspaceIndex, [...workspace]);
                    newState.get(action.workspaceIndex)![action.id] = action.card ? action.card : BASE_CARD;
                    return newState;
                }
            }
            return state;

        case "ADD_CARD":
            if (action.workspaceIndex) {
                const workspace = state.get(action.workspaceIndex);
                if (workspace) {
                    const newState = new Map(state);
                    newState.set(action.workspaceIndex, [...workspace, action.card ? action.card : BASE_CARD]);
                    return newState;
                }
            }
            return state;

        case "DELETE_CARD":
            if (action.workspaceIndex && action.id !== undefined) {
                const workspace = state.get(action.workspaceIndex);
                if (workspace && workspace.length > 0) {
                    const newState = new Map(state);
                    const newWorkspace = [...workspace];
                    newWorkspace.splice(action.id, 1);
                    newState.set(action.workspaceIndex, newWorkspace);
                    return newState;
                }
            }
            return state;

        case "LOAD":
            if (action.workspaceIndex) {
                const newState = new Map(state);
                newState.set(action.workspaceIndex, action.workspace ? action.workspace : [BASE_CARD]);
                return newState;
            }
            return state;

        case "BOOT":
            return action.project ? action.project : new Map<string, CardItem[]>([["workspace", [BASE_CARD]]]);

        case "ADD_WORKSPACE":
            const newState = new Map(state);
            newState.set(action.workspaceIndex ? action.workspaceIndex : "workspace", action.workspace ? action.workspace : [BASE_CARD]);
            return newState;

        case "CLEAR":
            if (action.workspaceIndex) {
                const newState = new Map(state);
                newState.set(action.workspaceIndex, [BASE_CARD]);
                return newState;
            }
            return state;

        case "DELETE_WORKSPACE":
            if (action.workspaceIndex) {
                const newState = new Map(state);
                newState.delete(action.workspaceIndex);
                if (newState.size == 0) {
                    newState.set("workspace", [BASE_CARD]);
                }
                return newState;
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

function reviver(_key: string, value: any) {
    if(typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
    }
    return value;
}


function App() {
    const [currentCard, changeCurrentCard] = useState<number>(-1)
    const [currentWorkspace, changeCurrentWorkspace] = useState<string>("workspace")
    const [shiftPressed, setShiftPressed] = useState<boolean>(false);
    const [data, dispatch] = useReducer(reducer, new Map<string, CardItem[]>([["workspace", [{
        title: "A Stupid Drone",
        tech: "Javascript, React, Tailwind",
        comments: "- Hi\n- This is a comment\n- And another one",
        caption: "A ESP32 drone that is really stupid and can't do anything, but it's still pretty cool"
    }]]]));
    const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState<boolean>(false);
    let workspaceNames = Array.from(data.keys())
    const updateXarrow = useXarrow();

    const handleKeyDown = (event: KeyboardEvent) => {
        console.log('Global key press:', event.key);
        // You can check for specific keys, e.g., for accessibility shortcuts
        if (event.key === 'Shift') {
            setShiftPressed(true)
        }
        if (!shiftPressed && event.key === 'Enter') {
            changeCurrentCard(-1)
        }
    };

    const handleKeyUp = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Shift') {
            setShiftPressed(false)
        }
    }, []);

    const onBeforeUnload = (e: BeforeUnloadEvent) => {

        localStorage.setItem("data", JSON.stringify(data, replacer))
        console.log('Saved JSON data to localStorage:', data);

        console.log(e.target)

        // e.preventDefault(); Would stop user
        return "Anything here as well, doesn't matter!";
    };

    useEffect(() => {
        const temp: string | null = localStorage.getItem("data")
        if (temp) {
            try {
                const jsonData = JSON.parse(temp, reviver) as Map<string, CardItem[]>;
                if(!jsonData.values()) return;
                dispatch({ type: "BOOT", project: jsonData })
                console.log('Loaded JSON data from localStorage:', jsonData);
            }
            catch (error) {
                console.error('Error parsing JSON from localStorage:', error);
            }
        }
    }, []);

    useEffect(() => {
        window.addEventListener("beforeunload", onBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", onBeforeUnload);
        };
    }, [onBeforeUnload]);

    useEffect(() => {
        // Add the event listener when the component mounts
        document.addEventListener('keydown', handleKeyDown as EventListener);

        // Remove the event listener when the component unmounts (cleanup)
        return () => {
            document.removeEventListener('keydown', handleKeyDown as EventListener);
        };
    }, [handleKeyDown]); // Re-run effect if handleKeyDown changes

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
                        dispatch({ type: "LOAD", workspaceIndex: currentWorkspace, workspace: jsonData })
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
                try { updateXarrow(); } catch (e) { /* swallow */ }
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
                {!workspaceMenuOpen && <div
                    className="fixed left-0 top-0 h-screen w-50 flex items-center align-middle justify-items-center justify-center bg-linear-to-r from-green-200/25 to-slate-900/0 transition-all opacity-0 hover:opacity-100 duration-400">
                    <button onClick={() => setWorkspaceMenuOpen(true)}
                            className="z-20 absolute left-2/12 inline-block max-h-10 mx-2 my-6 p-2 rounded-lg bg-slate-200 dark:bg-slate-900 text-slate-900 dark:text-white hover:ring-2 hover:ring-green-200 cursor-pointer">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>}
                <Workspace data={data} currentWorkspace={currentWorkspace} changeCurrentCard={changeCurrentCard}
                           currentCard={currentCard} dispatch={dispatch}/>
                <div className="fixed right-6 top-0 flex align-middle items-center">
                    <form method="post" encType="multipart/form-data">
                        <div className="flex">
                            <label htmlFor="json_upload"
                                   className="mx-2 my-6 inline-block px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-900 hover:ring-2 hover:ring-green-200 text-slate-900 dark:text-white">Upload</label>
                            <input type="file" id="json_upload" name="json_upload" accept=".txt" onChange={(e) => uploadFile(e)}
                                   className="size-0 opacity-0"/>
                        </div>
                    </form>
                    <button onClick={() => saveContext()} className="inline-block mx-2 my-6 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-900 hover:ring-2 hover:ring-green-200 text-slate-900 dark:text-white cursor-pointer">Export</button>
                </div>
                <div className="fixed left-6 top-0 flex align-middle items-center">
                    <button onClick={() => dispatch({type: "CLEAR", workspaceIndex: currentWorkspace})} className="inline-block mx-2 my-6 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-900 hover:ring-2 hover:ring-green-200 text-slate-900 dark:text-white cursor-pointer">Clear</button>
                </div>
                {workspaceMenuOpen && <div
                    className="overflow-auto rounded-r-2xl fixed px-8 py-12 left-0 top-0 h-screen w-3/12  bg-slate-400/30 backdrop-blur-md transition-all duration-400">
                    <h1 className="mb-10 font-bold text-4xl text-slate-300">Workspaces</h1>
                    {workspaceNames.map((index: string) => {
                        return (
                            <div key={"workspace_button_" + index} className="flex items-center justify-between max-w-10/12 my-4 p-3.5 rounded-lg bg-slate-900 hover:ring-2 hover:ring-green-200 cursor-pointer"
                                 onClick={() => {
                                     changeCurrentWorkspace(index)
                                 }}>
                                <button onClick={(e) => {
                                    e.stopPropagation()
                                    dispatch({ type: "DELETE_WORKSPACE", workspaceIndex: index })
                                    if (currentWorkspace === index) {
                                        if (data.size === 1) {
                                            changeCurrentWorkspace("workspace")
                                        }
                                        else if (Array.from(data.keys())[0] == index) {
                                            changeCurrentWorkspace(Array.from(data.keys())[1]);
                                        }
                                        else {
                                            changeCurrentWorkspace(Array.from(data.keys())[0]);
                                        }
                                    }
                                }} className="material-symbols-outlined text-slate-300 hover:text-indigo-400"><span>delete</span></button>
                                <h2 className="text-md font-semibold text-slate-300">{index}</h2>
                                <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                            </div>
                        )
                    })}
                    <button onClick={() => {
                        let num = data.size;
                        while (data.has("workspace" + num.toString())) {
                            num++
                        }
                        dispatch({ type: "ADD_WORKSPACE", workspaceIndex: "workspace" + num.toString()})
                        changeCurrentWorkspace("workspace" + (num).toString())
                        setWorkspaceMenuOpen(false)
                    }} className="w-full mt-8 max-w-10/12 inline-block px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-900 hover:ring-2 hover:ring-green-200 text-slate-900 dark:text-white cursor-pointer">+ New Workspace</button>
                    <div className="absolute top-0 right-4 w-2/12 h-screen flex items-center">
                        <button onClick={() => setWorkspaceMenuOpen(false)}
                                className="z-20 right-0 absolute inline-block max-h-10 mx-2 my-6 p-2 rounded-lg bg-slate-200 dark:bg-slate-900 text-slate-900 dark:text-white hover:ring-2 hover:ring-green-200 cursor-pointer">
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                    </div>
                </div>}
            </div>
        </>
    )
}

export default App
