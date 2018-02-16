export const DOC = ' * '
export const DEFAULT_SP = '  '
export let SP = DEFAULT_SP
export let ST = '' // statement terminator

export function applyFormatOptions(options: ClientOptions) {
  switch (`${options.indent}`) {
    case 'tab':
    case '\t':
      SP = '\t'
      break
    case '4':
      SP = '    '
      break
    case '2':
      SP = '  '
      break
    case 'spaces':
    default:
      SP = DEFAULT_SP
      break
  }
  if (options.semicolon) {
    ST = ';'
  }
}

export function formatDocDescription(description: string): string {
  return (description || '').trim().replace(/\n/g, `\n${DOC}${SP}`)
}

export function getDocType(param: any): string {
  if (!param) {
    return 'Object'
  } else if (param.$ref) {
    const type = param.$ref.split('/').pop()
    return `module:types.${type}`
  } else if (param.schema) {
    return getDocType(param.schema)
  } else if (param.type === 'array') {
    if (param.items.type) {
      return `${getDocType(param.items)}[]`
    } else if (param.items.$ref) {
      const type = param.items.$ref.split('/').pop()
      return `module:types.${type}[]`
    } else {
      return 'object[]'
    }
  } else if (param.type === 'integer') {
    return 'Number'
  } else if (param.type === 'string' && (param.format === 'date-time' || param.format === 'date')) {
    return 'Date'
  } else if (param.type === 'string') {
    return 'String'
  } else {
    return param.type || 'object'
  }
}

export let enums: { [k: string]: string } = {}

export function resetEnums() {
  enums = {}
}


export function createLogParameter(type: string) {
  if (type.endsWith('[]')) {
    type = `${type.substr(0, type.length - 2)}, true`
  }
  return `@logParameter(${type})`
}

export function logParameterHeader() {
  return `import 'reflect-metadata';
export function operations(target: any) {
  Reflect.defineMetadata('classType', 'operations', target)
}
export function optional(target: any, key: string, index?: number) {
    let metadata = Reflect.getMetadata(key, target) || []
    let current = { index: index, optional: true }
    let elId = metadata.findIndex(el => el.index === index)
    if(elId !== -1) metadata[elId] = { ...metadata[elId], ...current }
    else metadata.push(current)
    Reflect.defineMetadata(key, metadata, target)
}
export function logParameter(type: Object, isArray: boolean = false) {
  return function (target: any, key: string, index?: number) {
    let metadata = Reflect.getMetadata(key, target) || []
    let current = { index: index, type: type, isArray: isArray }
    let elId = metadata.findIndex(el => el.index === index)
    if(elId !== -1) metadata[elId] = { ...metadata[elId], ...current }
    else metadata.push(current)
    Reflect.defineMetadata(key, metadata, target)
  }
}
`
}

export function generateEnumName(cls: string[]) {
  return cls.join('').replace(/[\/\\\+\.\:]/g, '')
}

export function getTSParamType(param: any, inTypesModule?: boolean): string {
  if (!param) {
    return 'Object'
  } else if (param.enum) {
    let key = generateEnumName(param.enum)
    let value = ''
    if (!param.type || param.type === 'string') value = `'${param.enum.join(`','`)}'`
    else if (param.type === 'number') value = `${param.enum.join(`,`)}`
    if (!enums[key]) enums[key] = `export enum ${key} { ${value} }`
    return `enums.${key}`
  }
  if (param.$ref) {
    const type = param.$ref.split('/').pop()
    return inTypesModule
      ? type
      : `api.${type}`
  } else if (param.schema) {
    return getTSParamType(param.schema, inTypesModule)
  } else if (param.type === 'array') {
    if (param.items.type) {
      if (param.items.enum) {
        return `${getTSParamType(param.items, inTypesModule)}[]`
      } else {
        return `${getTSParamType(param.items, inTypesModule)}[]`
      }
    } else if (param.items.$ref) {
      const type = param.items.$ref.split('/').pop()
      return inTypesModule
        ? `${type}[]`
        : `api.${type}[]`
    } else {
      return 'Object[]'
    }
  } else if (param.type === 'object') {
    if (param.additionalProperties) {
      const extraProps = param.additionalProperties
      return `{[key: string]: ${getTSParamType(extraProps, inTypesModule)}}`
    }
    return 'Object'
  } else if (param.type === 'integer' || param.type === 'number') {
    return 'Number'
  } else if (param.type === 'string' && (param.format === 'date-time' || param.format === 'date')) {
    return 'Date'
  } else if (param.type === 'string') {
    return 'String'
  } else if (param.type === 'boolean') {
    return 'Boolean'
  } else {
    return param.type || 'any'
  }
}
