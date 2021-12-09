
export interface WikipediaPageResult {
    pageid : number;
    ns : number;
    title : string;
    index : number;
    revisions? : WikipediaRevision[];
}

export interface WikipediaRevision {
    contentformat : string;
    contentmodel : string;
    content : string;
}

export interface WikipediaPageResultMap {
    [ index : string ] : WikipediaPageResult;
}

export interface WikipediaResultSet {
    pages : WikipediaPageResultMap;
}

export interface WikipediaContinue {
    gsroffset : number;
    continue : string;
}

export interface WikipediaSearchResults {
    batchcomplete : any;
    continue : WikipediaContinue;
    query : WikipediaResultSet;
}
