import { InputNode }      from './inputNode';
import { LLMNode }        from './llmNode';
import { OutputNode }     from './outputNode';
import { TextNode }       from './textNode';
import { ConditionNode }  from './conditionNode';
import { JsonParserNode } from './jsonParserNode';
import { EmailNode }      from './emailNode';
import { DelayNode }      from './delayNode';
import { ApiNode }        from './apiNode';

export { InputNode, LLMNode, OutputNode, TextNode, ConditionNode, JsonParserNode, EmailNode, DelayNode, ApiNode };

export const nodeTypes = {
  customInput:  InputNode,
  customOutput: OutputNode,
  llm:          LLMNode,
  text:         TextNode,
  condition:    ConditionNode,
  jsonParser:   JsonParserNode,
  email:        EmailNode,
  delay:        DelayNode,
  api:          ApiNode,
};
