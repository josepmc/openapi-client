import { DOC, SP, ST, getDocType, getTSParamType } from './support'
import { writeFileSync } from '../util'

export default function genSpec(spec: ApiSpec, options: ClientOptions) {
  const file = genSpecFile(spec, options)
  writeFileSync(file.path, file.contents)
}

export function genSpecFile(spec: ApiSpec, options: ClientOptions) {
  return {
    path: `${options.outDir}/gateway/spec.${options.language}`,
    contents: renderSpecView(spec, options)
  }
}

function renderSpecView(spec: ApiSpec, options: ClientOptions): string {
  const view = {
    host: options.host || spec.host,
    schemes: options.schemes || spec.schemes,
    basePath: spec.basePath,
    contentTypes: spec.contentTypes,
    accepts: spec.accepts,
    securityDefinitions: options.securityDefinitions || spec.securityDefinitions || (spec as any).components.securitySchemes,
    timeout: options.timeout
  }
  const type = (options.language === 'ts') ? ': api.OpenApiSpec' : ''
  return `${options.language === 'ts' ? '/// <reference path="../types.ts"/>' : ''}
// Auto-generated, edits will be overwritten
let spec${type} = ${stringify(view)}${ST}
spec.getAuthorization = ${options.getAuthorization}
spec.applyAuthorization = ${options.applyAuthorization}
export default spec${ST}
`
}

function stringify(view: any): string {
  const str = JSON.stringify(view, null, 2)
  return str.replace(/"/g, `'`).replace(/  /g, SP)
}