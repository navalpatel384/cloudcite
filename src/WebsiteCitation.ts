import * as store from './store';
//@ts-ignore
import * as  _ from 'lodash/core';
export default class WebsiteCitation {
    contributors: any[]
    source: string
    title: string
    url: string
    publisher: string
    issued: any

    constructor(contributors: any, source: any, title: any, url: any, publisher: any, issued: any) {
        this.contributors = contributors
        this.source = source
        this.title = title
        this.url = url
        this.publisher = publisher
        this.issued = issued //date published
    }

    removeContributor(index: number) {
        this.contributors = this.contributors.filter(element => element !== this.contributors[index]);
    }
    clearContributor(index: number) {
        this.contributors[index] = Object.assign(this.contributors[index], {given: null, middle: null, family: null, type: "Author"})
    }

    toCSL() {
        var cslMonth = this.issued.month + 1
        var accessedDate = new Date()
        var id = ('Website/' + _.filter(store.default.getters.getCitations, function(c: any) { return Object.keys(c)[0].substring(0, 7) === 'Website'}).length)
        return {
            [id]: {
                "accessed":{
                    "month": cslMonth ? cslMonth: "",
                    "year": accessedDate.getFullYear(),
                    "day": accessedDate.getDay()
                },
                "issued":{
                    "month": this.issued.month ? this.issued.month: "",
                    "year": this.issued.year ? this.issued.year: "",
                    "day": this.issued.day ? this.issued.day: ""
                },
                "type":"website",
                "id": id,
                "author": this.contributors.filter(c => c.type === "Author"),
                "editor": this.contributors.filter(c => c.type === "Editor"),
                "title": this.title ? this.title: "",
                "URL": this.url ? this.url: ""
            }
        }
    }
}