import genOperations from './genOperations'
import genReduxActions from './genReduxActions'
import genService from './genService'
import genTypes from './genTypes'
import genSpec from './genSpec'
import { applyFormatOptions, logParameterHeader } from './support'
import { writeFileSync } from '../util';

export default function genCode(spec: ApiSpec, operations: ApiOperation[], options: ClientOptions): ApiSpec {
  applyFormatOptions(options)
  genService(options)
  genSpec(spec, options)
  let enums: string[] = genOperations(spec, operations, options)
  enums = enums.concat(genTypes(spec, options))
  writeFileSync(`${options.outDir}/enums.${options.language}`, enums.filter((el, idx) => enums.indexOf(el) === idx).join('\n'))
  writeFileSync(`${options.outDir}/utils.${options.language}`, logParameterHeader())
  if (options.redux) genReduxActions(spec, operations, options)
  return spec
}
