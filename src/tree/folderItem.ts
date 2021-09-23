/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { TreeItem, TreeItemCollapsibleState, Uri } from 'vscode';
import * as path from 'path';
import { Quickfix } from '../quickfix/quickfix';

export class FolderItem extends TreeItem {

    collapsibleState: TreeItemCollapsibleState = TreeItemCollapsibleState.None;
    iconPath: string | Uri | { light: string | Uri; dark: string | Uri } | undefined;

    private folder: string;
    private hasQuickfixes: boolean;

    constructor(folder: string, hasQuickfixes: boolean) {
        super(folder);
        this.folder = folder;
        this.hasQuickfixes = hasQuickfixes;
        this.refresh();
    }

    public refresh(): void {
        this.label = path.basename(this.folder);
        this.collapsibleState = TreeItemCollapsibleState.Collapsed;
    }

    public get contextValue(): string {
        return this.hasQuickfixes ? Quickfix.CONTAINER : undefined;
    }
}
