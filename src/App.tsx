import {useCallback, useEffect, useLayoutEffect, useState} from 'react'
import Card from "./Components/card.tsx";
import Xarrow, {Xwrapper, useXarrow} from "react-xarrows";

// Reuse CardItem type shape from Card component
interface CardItem {
    title: string
    tech: string
    comments: string
    caption: string
}

function App() {
    const [current, changeCurrent] = useState<number>(-1)
    const [shiftPressed, setShiftPressed] = useState<boolean>(false);
    const [data, setData] = useState<CardItem[]>([{
        title: "A Stupid Drone",
        tech: "Javascript, React, Tailwind",
        comments: "- Hi\n- This is a comment\n- And another one",
        caption: "A ESP32 drone that is really stupid and can't do anything, but it's still pretty cool"
    }])
    const updateXarrow = useXarrow();

    const handleKeyDown = (event: KeyboardEvent) => {
        console.log('Global key press:', event.key);
        // You can check for specific keys, e.g., for accessibility shortcuts
        if (event.key === 'Shift') {
            setShiftPressed(true)
        }
        if (!shiftPressed && event.key === 'Enter') {
            changeCurrent(-1)
        }
    };

    const handleKeyUp = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Shift') {
            setShiftPressed(false)
        }
    }, []);

    const onBeforeUnload = (e: BeforeUnloadEvent) => {

        //TODO: only trigger this if there are unsaved changes, otherwise it's really annoying
        //#############
        console.log("SOME CODE HERE");
        //#############
        e.preventDefault();
        return "Anything here as well, doesn't matter!";
    };

    useEffect(() => {
        window.addEventListener("beforeunload", onBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", onBeforeUnload);
        };
        // changeNumCards(1)
    }, []);

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
        if (!target) { changeCurrent(-1); return }

        for (let i = 0; i < data.length; i++) {
            if (target.closest(".card" + i.toString())) {
                if (current !== i) changeCurrent(i)
                return
            }
        }
        changeCurrent(-1)
    }

    const uploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        changeCurrent(-2)
        const file = e.target.files && e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event: ProgressEvent<FileReader>) => {
                const fileContent = event.target?.result;
                console.log('File content:', fileContent);
                if (typeof fileContent === 'string') {
                    try {
                        const jsonData = JSON.parse(fileContent) as CardItem[];
                        setData(jsonData)
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
        const blob = new Blob([JSON.stringify(data)], { type: 'text/plain' }); // Specify the file's MIME type
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

    const createNewCard = () => {
        changeCurrent(data.length)
        setData([...data, {
            title: "A Stupid Drone",
            tech: "Javascript, React, Tailwind",
            comments: "- Hi\n- This is a comment\n- And another one",
            caption: "A ESP32 drone that is really stupid and can't do anything, but it's still pretty cool"
        }])
        console.log("Creating new card")
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
    }, [data, current]);

    return (
        <>
            <div onClick={(e) => checkClick(e as unknown as MouseEvent)}
                 className=" max-h-screen bg-transparent">
                <div className="min-h-screen min-w-full flex items-center justify-start p-10">
                    <Xwrapper>
                        {data.map((_item, index) => {
                            return (
                                <div key={"card_container_" + index} className="min-w-fit flex items-center">
                                    <div id={"card" + index.toString()} key={"card_div" + index.toString()}
                                         className="rounded-xl relative hover:ring-2 hover:ring-green-200 mx-10">
                                        <Card key={index} id={index} current={current} data={data} setData={setData}/>
                                    </div>

                                    {/* Render an arrow after each card except the last one */}
                                    {index < data.length - 1 && (
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
                                strokeWidth={12}
                                tailSize={20}
                                headSize={4}
                                color={"#b9f8cf"}
                                animateDrawing={true}
                                start={"card" + (data.length-1).toString()}
                                end={"card" + (data.length).toString()}
                            />
                        </div>

                        <div id={"card" + data.length.toString()} className="relative left-20 min-lg"/>
                    </Xwrapper>
                </div>
                <div className="fixed right-6 top-0 flex align-middle items-center">
                    <form method="post" encType="multipart/form-data">
                        <div className="flex">
                            <label htmlFor="json_upload"
                                   className="mx-2 my-6 inline-block px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-900 hover:ring-2 hover:ring-green-200 text-slate-900 dark:text-white">Upload</label>
                            <input type="file" id="json_upload" name="json_upload" accept=".txt" onChange={(e) => uploadFile(e)}
                                   className="size-0 opacity-0"/>
                        </div>
                    </form>
                    <button onClick={() => saveContext()} className="inline-block mx-2 my-6 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-900 hover:ring-2 hover:ring-green-200 text-slate-900 dark:text-white">Export</button>
                </div>
            </div>
        </>
    )
}

export default App
