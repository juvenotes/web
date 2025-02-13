declare module '@citation-js/core' {
  export class Cite {
    static async(input: any): Promise<Cite>
    format(
      type: string,
      options: {
        format?: string
        template?: string
        lang?: string
      }
    ): any
  }
}

declare module '@citation-js/plugin-bibtex' {}
declare module '@citation-js/plugin-doi' {}
declare module '@citation-js/plugin-csl' {}
