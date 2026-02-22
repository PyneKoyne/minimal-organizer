import Xarrow, { Xwrapper } from "react-xarrows"
import Card from "./card.tsx";

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

interface WorkspaceProps {
    changeCurrentCard: (index: number) => void;
    data: Map<string, CardItem[]>;
    currentWorkspace: string;
    dispatch: (action: DataReducer) => void;
    currentCard: number;
}

const Workspace = ({changeCurrentCard, data, currentWorkspace, dispatch, currentCard}: WorkspaceProps) => {
    const currentWorkspaceData = data.get(currentWorkspace);

    const createNewCard = () => {
        if (currentWorkspaceData) {
            changeCurrentCard(currentWorkspaceData.length)
            dispatch({ type: "ADD_CARD", workspaceIndex: currentWorkspace, card: {
                    title: "A Stupid Drone",
                    tech: "Javascript, React, Tailwind",
                    comments: "- Hi\n- This is a comment\n- And another one",
                    caption: "A ESP32 drone that is really stupid and can't do anything, but it's still pretty cool"
                }
            })
            console.log("Creating new card")
        }
    }

    const setData = (newCard: CardItem) => {
        dispatch({ type: "UPDATE", workspaceIndex: currentWorkspace, id: currentCard, card: newCard })
    }

    const deleteCard = (id: number) => {
        dispatch({ type: "DELETE_CARD", workspaceIndex: currentWorkspace, id: id})
    }

    if (!currentWorkspaceData) return null;

    return (
        <div className="min-h-screen min-w-full flex items-center justify-start p-25">

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
    )
}

export default Workspace;