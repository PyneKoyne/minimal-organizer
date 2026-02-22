import {useEffect} from 'react'

// Define the shape of a single card item
interface CardItem {
    title: string
    tech: string
    comments: string
    caption: string
}

// Define the props for the Card component
interface CardData {
    id: number;
    current: number | null;
    data: CardItem[];
    setData: (newData: CardItem) => void;
    deleteCard: (id: number) => void;
}

const Card = ({id, current, data, setData, deleteCard}: CardData) => {
    const title:string = data[id].title
    const tech:string = data[id].tech
    const comments:string = data[id].comments
    const caption:string = data[id].caption
    const edit:boolean = current == id

    const changeTitle = (newTitle: string) => {
        setData({
                title: newTitle,
                tech: tech,
                comments: comments,
                caption: caption
            })
    }

    const changeTech = (newTech: string) => {
        setData({
                title: title,
                tech: newTech,
                comments: comments,
                caption: caption
            })
    }

    const changeComments = (newComments: string) => {
        setData({
                title: title,
                tech: tech,
                comments: newComments,
                caption: caption
            })
    }

    const changeCaption = (newCaption: string) => {
        setData({
                title: title,
                tech: tech,
                comments: comments,
                caption: newCaption
            })
    }

    useEffect(() => {
        if (!edit) {
            if (title.trim().length === 0) {
                deleteCard(id)
            }
        }
    }, [edit])

    return (
        <>
            <div className={"card" + id.toString()}>
                <div
                    className="min-block-4 p-4 sm:p-6 md:p-8 items-center justify-center bg-white/6 dark:bg-slate-900 rounded-2xl">
                    {edit ? <input type="text" value={title} onChange={e => changeTitle(e.target.value)}
                                   style={{width: '100%'}}
                                   className="my-2 w-full max-w-70 sm:max-w-75 md:max-w-95 p-3 rounded-md border border-gray-700 bg-slate-800/60 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-shadow duration-150 ease-in-out dark:text-white text-lg sm:text-xl font-semibold leading-tight"/>
                        : <h1 className="w-full max-w-70 sm:max-w-75 md:max-w-95 overflow-hidden mb-1 text-lg sm:text-2xl md:text-2xl lg:text-3xl font-bold text-gray-100 dark:text-white">{title}</h1>
                    }
                    {edit ? <input type="text" value={tech} onChange={e => changeTech(e.target.value)}
                                   style={{width: '100%'}}
                                   className="my-2 block w-full max-w-70 sm:max-w-75 md:max-w-95 p-2 rounded-md border border-gray-700 bg-slate-800/60 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-shadow duration-150 ease-in-out dark:text-white text-sm sm:text-sm md:text-base font-medium leading-snug"/>
                        : <h2 className="w-full max-w-70 sm:max-w-75 md:max-w-95 overflow-hidden text-sm sm:text-base md:text-lg text-gray-300 dark:text-gray-300 mb-2">{tech}</h2>
                    }
                    <hr className="my-4 border-gray-700"/>
                    {edit ? <textarea cols={20} rows={5} value={comments} onChange={e => changeComments(e.target.value)}
                                      style={{width: '100%'}}
                                      className="my-2 block resize-none w-full max-w-70 sm:max-w-75 md:max-w-95 p-3 rounded-md border border-gray-700 bg-slate-800/60 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-shadow duration-150 ease-in-out dark:text-white text-sm sm:text-sm md:text-sm leading-6"/>
                        : <pre className="leading-7 w-full max-w-70 sm:max-w-75 md:max-w-90 whitespace-pre-wrap wrap-break-word my-2 text-sm text-gray-200 dark:text-gray-100">{comments.trim()}</pre>
                    }

                    {(caption.length > 0 || edit) && <hr className="my-4 border-gray-700"/>}
                    {edit ? <textarea cols={20} rows={3} value={caption} onChange={e => changeCaption(e.target.value.replaceAll("\n", ""))}
                                      style={{width: '100%'}}
                                      className="w-full max-w-70 sm:min-w-75 md:min-w-95 wrap-break-word whitespace-pre-wrap my-2 block resize-none p-3 rounded-md border border-gray-700 bg-slate-800/60 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-shadow duration-150 ease-in-out dark:text-white text-sm sm:text-sm md:text-sm leading-6"/>
                        : <p className="w-full sm:max-w-75 md:max-w-90 whitespace-pre-wrap wrap-break-word my-2 text-sm text-gray-300 dark:text-gray-300">{caption}</p>
                    }
                </div>
            </div>
        </>
    )
}

export default Card
