import { environment } from "../../environments/environment";
import { WikipediaSearchResults, WikipediaPageResult } from "./wikipedia.upstream";
import { Injectable } from "@angular/core";

import wtf from 'wtf_wikipedia';
import wtfHtml from 'wtf-plugin-html';

wtf.extend(wtfHtml);

@Injectable()
export class Wikipedia {

    async parseWikitext(wikitext : string) {
        return wtf(wikitext);
    }

    async request<T>(query : any): Promise<T> {
        let headers = new Headers();

        headers.append('Api-User-Agent', `@rezonant/devtools@${environment.version} (https://tools.rezonant.dev/)`);
        
        query = Object.assign({
            origin: '*',
            format: 'json'

            // Even though this seems more proper, it's not.
            // MediaWiki docs specify that you should use '*' if you don't 
            // need credentials to be included in the request. Sliptap doesn't need that.
            // In order to pass the real origin, Sliptap would have to be authorized 
            // at Wikipedia specifically.
            // 
            // https://www.mediawiki.org/wiki/API:Cross-site_requests
            
            //origin: `${window.location.protocol}//${window.location.host}`
        }, query);

        let queryString = Object.keys(query).map(x => `${x}=${encodeURIComponent(query[x])}`).join('&');

        let response = await fetch(`https://en.wikipedia.org/w/api.php?${queryString}`, {
            headers
        });

        return await response.json();
    }

    async getPages(pageNames : string[]): Promise<WikipediaSearchResults> {
        return await this.query({
            titles: pageNames.join('|'),
            prop: 'revisions',
            rvprop: 'content'
        });
    }

    async query(query : any): Promise<WikipediaSearchResults> {
        return await this.request<WikipediaSearchResults>(Object.assign({
            action: 'query'
        }, query));
    }

    async search(query : string): Promise<WikipediaSearchResults> {
        return await this.query({
            gsrlimit: 15,
            generator: 'search',
            gsrsearch: query
        });
    }
}