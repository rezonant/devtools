import { Component } from "@angular/core";
import { HTML_ENTITIES } from "../references/html-entities";
import { ToolComponent } from "./tool-component";
import { Wikipedia } from "./wikipedia";
import { WikipediaSearchResults } from "./wikipedia.upstream";

export interface WikipediaState {
    pageId : string;
    query : string;
    plainText : string;
    html : string;
    url : string;
    title : string;
    results : WikipediaSearchResults;
}

@Component({
    template: `
        @if (loading || !state) {
          <mat-spinner></mat-spinner>
        } @else {
          <form (submit)="state.pageId = null; loadPage()">
            <mat-form-field appearance="outline" class="search">
              <span matPrefix>
                <mat-icon>search</mat-icon>
              </span>
              <mat-label>
                <img class="logo" src="/assets/wikipedia-wordmark.svg" alt="Wikipedia" />
                <!-- <ng-container *ngIf="state.title">
                &raquo;
                {{state.title}}
                </ng-container> -->
              </mat-label>
            <input type="text" matInput name="search" [(ngModel)]="state.query" placeholder="Search for pages" />
            </mat-form-field>
          </form>
          @if (state.pageId) {
            <header>
              <h1>{{state.title}}</h1>
            </header>
            <div class="wikihtml" [innerHTML]="state.html | trustedHtml"></div>
          } @else {
            <!-- <pre>{{state.results | json}}</pre> -->
            @if (!state.results) {
              Search above for Wikipedia content.
            } @else {
              @for (result of results; track result) {
                <div class="search-result">
                  <a (click)="state.pageId = result.title; state.query = null; loadPage()" href="javascript:;">
                    {{result.title}}
                  </a>
                </div>
              }
            }
          }
        }
        `,
    styles: [`
        :host {
            width: 1200px;
            max-width: 100%;
            margin: 1em auto 0 auto;
        }
        mat-form-field.search {
            width: 100%;
        }

        .logo {
            height: 1.2em;
            background: #333333;
            vertical-align: middle;
            position: relative;
            top: -2px;
        }

        .wikihtml ::ng-deep {
            .section:first-of-type {
                order: -1;
            }

            img {
                background: white;
                box-shadow: 2px 2px 8px rgb(0 0 0 / 50%);
                border-radius: 3px;
                float: right;
                margin: 0 0 40px 40px;
            }

            .infobox {
                float: right;
                display: table;
                width: 150px;
                border: 1px solid #5b5b5b;
                margin: 0 2em;
                padding: 1em;
                border-radius: 4px;

                img {
                    margin: 8px;
                }
            }
        }
    `],
    standalone: false
})
export class WikipediaComponent extends ToolComponent<WikipediaState> {
    override label = 'Wikipedia';
    static override label = 'Wikipedia';
    static override id = 'wikipedia';

    constructor(
        private wikipedia : Wikipedia
    ) {
        super();
    }

    loading = false;
    error : string = null;
    page : string;

    async fetch() {
        this.state.html = null;
        
		let pages = await this.wikipedia.getPages([this.state.pageId]);
		let page = pages.query.pages[Object.keys(pages.query.pages)[0]];

		let doc = await this.wikipedia.parseWikitext(page.revisions[0].content || page.revisions[0]['*']);

		let txt = doc.text();
		this.state.plainText = txt.replace(/\n/g, "<br/>\n");
		
        this.state.title = page.title;
		this.state.url = `https://en.wikipedia.org/wiki/${page.title.replace(' ', '_')}`;

		let rawHtml = doc['html']();
		let parser = new DOMParser();
		let htmlDoc = parser.parseFromString(rawHtml, 'text/html');

		let links : HTMLAnchorElement[] = Array.from(htmlDoc.querySelectorAll('a.link'));

		links.forEach(link => {
			link.href = `https://wikipedia.org/wiki/${link.href.replace(/^.*\//, '')}`;
			link.target = '_blank';
		});

		this.state.html = htmlDoc.body.innerHTML;

		console.groupCollapsed(`Wikipedia page ${this.state.url}:`);
		console.log(this.state.html);
		console.groupEnd();
		console.groupCollapsed(`Wikipedia page ${this.state.url} (Raw HTML):`);
		console.log(rawHtml);
		console.groupEnd();
    }
    async loadPage() {
        this.loading = true;
        try {
            this.state.results = null;
            this.state.html = null;
            this.state.url = null;
            
            if (this.state.pageId) {
                this.fetch();
            } else if (this.state.query) {
                let results = await this.wikipedia.search(this.state.query);
                this.state.results = results;
            }
        } finally {
            this.loading = false;
        }
    }

    get results() {
        if (!this.state?.results?.query?.pages)
            return [];
        
        return Object.values(this.state.results.query.pages);
    }
}