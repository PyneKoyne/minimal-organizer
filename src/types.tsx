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
    data: CardItem[];
    setData: (newData: CardItem) => void;
    current: number;
    deleteCard: (id: number) => void;
}

interface DataReducer {
    type: "UPDATE" | "ADD_CARD" | "DELETE_CARD" | "LOAD" | "ADD_WORKSPACE" | "RENAME_WORKSPACE" | "CLEAR" | "BOOT" |
        "DELETE_WORKSPACE" | "SET_WORKSPACE_INDEX" | "TOGGLE_TITLE";
    newWorkspaceName?: string;
    workspaceIndex?: number;
    id?: number;
    card?: CardItem;
    workspace?: CardItem[];
    project?: WorkingData;
    showTitle?: boolean;
}

interface WorkingData {
    index: number;
    head: WorkspaceData[];
    values: Map<string, CardItem[]>;
}

interface WorkspaceData {
    key: string;
    title: boolean;
}

interface WorkspaceProps {
    changeCurrentCard: (index: number) => void;
    currentCard: number;
}

interface WorkspaceMenuProps {
    workspaceMenuOpen: boolean;
    setWorkspaceMenuOpen: (open: boolean) => void;
}

export type { CardItem, CardData, DataReducer, WorkspaceData, WorkspaceProps, WorkspaceMenuProps, WorkingData }