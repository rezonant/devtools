import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({name: 'trustedHtml'})
export class TrustedHtmlPipe implements PipeTransform {
    constructor(private domSanitizer : DomSanitizer) {
    }

    transform(value: any): any {
        return this.domSanitizer.bypassSecurityTrustHtml(value);
    }
}