import {createContext} from "react";
import type {DataReducer, WorkingData} from "./types.tsx";
import * as React from "react";
import {RenamingStatus} from "./constants.tsx";

const DataContext = createContext<{
    workspaceData: WorkingData;
    dispatch: React.ActionDispatch<[action: DataReducer]>;
} | null>(null);

const WorkspaceContext = createContext<{
    renaming: typeof RenamingStatus[keyof typeof RenamingStatus];
    setRenaming: (renaming: typeof RenamingStatus[keyof typeof RenamingStatus]) => void;
    tempName: string;
    setTempName: (name: string) => void;
} | null>(null);

export {DataContext, WorkspaceContext};