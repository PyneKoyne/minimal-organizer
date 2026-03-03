import Xarrow, { Xwrapper } from "react-xarrows"
import Card from "./card.tsx";
import type {CardItem, WorkspaceProps} from "../types.tsx";
import {DataContext, WorkspaceContext} from "../ContextProvider.tsx";
import {useContext} from "react";
import {RenamingStatus} from "../constants.tsx";

const BASE_CARD: CardItem = {
    title: "Fried and Fried Again",
    tech: "Javascript, React, Tailwind",
    comments: "- Hi\n- This is a comment\n- And another one",
    caption: "This is a caption"
}


const Workspace = ({currentCard, changeCurrentCard}: WorkspaceProps) => {
    const {workspaceData, dispatch} = useContext(DataContext)!;
    const {renaming, setRenaming, tempName, setTempName} = useContext(WorkspaceContext)!;
    const workspaceProperties = workspaceData.head;
    const workspaceIndex = workspaceData.index;
    const data = workspaceData.values;
    const currentWorkspace = workspaceProperties[workspaceIndex].key;
    const currentWorkspaceData = data.get(currentWorkspace);
    const showTitle = workspaceProperties[workspaceIndex].title;

    const createNewCard = () => {
        if (currentWorkspaceData) {
            changeCurrentCard(currentWorkspaceData.length)
            dispatch({ type: "ADD_CARD", workspaceIndex: workspaceIndex, card: BASE_CARD
            })
            console.log("Creating new card")
        }
    }

    const setData = (newCard: CardItem) => {
        dispatch({ type: "UPDATE", workspaceIndex: workspaceIndex, id: currentCard, card: newCard })
    }

    const deleteCard = (id: number) => {
        dispatch({ type: "DELETE_CARD", workspaceIndex: workspaceIndex, id: id})
    }

    if (!currentWorkspaceData) return null;

    return (
        <div className="min-h-screen flex items-center p-25 justify-start">
            <div className="title_container">
            {showTitle ? ( (renaming === RenamingStatus.WorkspaceRenaming) ?
                    <input autoFocus defaultValue={tempName} onChange={(e) => {
                        const newName = e.target.value;
                        setTempName(newName)
                    }} className="fixed top-1/12 right-1/2 translate-x-1/2 mb-36 mt-12 text-8xl font-bold text-slate-300 bg-transparent border-b border-slate-300 focus:outline-none focus:border-indigo-400"/>
                    : <h1 onDoubleClick={() => {
                    setRenaming(RenamingStatus.WorkspaceRenaming);
                    setTempName(currentWorkspace)
                }} className="fixed top-1/12 right-1/2 translate-x-1/2  mb-36 mt-12 text-8xl font-bold text-slate-300">{(renaming !== RenamingStatus.NotRenaming) ? tempName : currentWorkspace}</h1>
                ) : <h1 className="fixed top-1/12 right-1/2 translate-x-1/2 mb-36 mt-12 text-8xl font-bold text-slate-300 opacity-0"> </h1>}
            </div>
            <div className="min-w-full flex items-center justify-start">
            <Xwrapper>
                {currentWorkspaceData.map((_item: CardItem, index: number) => {
                    return (
                        <div key={"card_container_" + index} className="min-w-fit flex items-center">
                            <div id={"card" + index.toString()} key={"card_div" + index.toString()}
                                 className="rounded-xl relative hover:ring-2 hover:ring-green-200 mx-10">
                                <Card key={index} id={index} current={currentCard} data={currentWorkspaceData} setData={setData} deleteCard={deleteCard}/>
                            </div>
                            {/* Render an arrow after each card except the last one */}
                            {index < currentWorkspaceData.length - 1 && (
                                <Xarrow
                                    key={"arrow" + index}
                                    strokeWidth={10}
                                    headSize={4}
                                    color={"#1d293d"}
                                    animateDrawing={true}
                                    start={"card" + index.toString()}
                                    end={"card" + (index + 1).toString()}
                                />
                            )}
                        </div>
                    )
                })}
                <div className="hover:ring-2 hover:ring-green-200" onClick={() => createNewCard()}>
                    <Xarrow
                        strokeWidth={10}
                        tailSize={20}
                        headSize={4}
                        color={"#b9f8cf"}
                        animateDrawing={true}
                        start={"card" + (currentWorkspaceData.length - 1).toString()}
                        end={"card" + (currentWorkspaceData.length).toString()}
                    />
                </div>

                <div id={"card" + currentWorkspaceData.length.toString()} className="relative left-15 min-lg"/>
            </Xwrapper>
            </div>
        </div>
    )
}

export default Workspace;