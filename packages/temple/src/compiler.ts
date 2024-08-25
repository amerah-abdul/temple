export type * from './types';

import AbstractDirective from './directives/AbstractDirective';
import { 
  IfDirective, 
  ElifDirective, 
  ElseDirective 
} from './directives/ConditionalDirective';
import DirectiveInterface from './directives/DirectiveInterface';
import IteratorDirective from './directives/IteratorDirective';
import { 
  TryDirective, 
  CatchDirective 
} from './directives/TryCatchDirective';

import Component from './component/Component';
import Lexer from './component/Lexer';
import Parser from './component/Parser';
import Tokenizer from './component/Tokenizer';
import ComponentTranspiler from './component/Transpiler';

import definitions, { 
  scalar, 
  data, 
  scan, 
  identifier 
} from './component/definitions';

import {
  camelize,
  capitalize,
  lowerlize,
  slugify,
  serialize,
  toJS,
  toTS,
  load
} from './component/helpers';

import DocumentBuilder from './document/Builder';
import DocumentManifest from './document/Manifest';
import DocumentTranspiler from './document/Transpiler';
import router from './document/router';
import { 
  esAliasPlugin, 
  esComponentPlugin, 
  esDocumentPlugin,
  esWorkspacePlugin
} from './document/plugins';
import FileSystem from './filesystem/FileSystem';
import FileLoader from './filesystem/FileLoader';
import NodeFS from './filesystem/NodeFS';

import Exception from './Exception';
import temple from './temple';

export {
  AbstractDirective,
  IfDirective, 
  ElifDirective, 
  ElseDirective,
  DirectiveInterface,
  IteratorDirective,
  TryDirective, 
  CatchDirective,
  Component,
  ComponentTranspiler,
  DocumentBuilder,
  DocumentManifest,
  DocumentTranspiler,
  FileSystem,
  FileLoader,
  NodeFS,
  Lexer,
  Parser,
  Tokenizer,
  Exception,
  definitions,
  scalar,
  data,
  scan,
  identifier,
  camelize,
  capitalize,
  lowerlize,
  slugify,
  serialize,
  toJS,
  toTS,
  load,
  esAliasPlugin, 
  esComponentPlugin, 
  esDocumentPlugin,
  esWorkspacePlugin,
  router
};

export default temple;