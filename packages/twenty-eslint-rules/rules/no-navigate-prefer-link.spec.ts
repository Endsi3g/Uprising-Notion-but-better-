import { RuleTester } from '@typescript-eslint/rule-tester';

import { rule, RULE_NAME } from './no-navigate-prefer-link';


// @ts-ignore
const ruleTester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      warnOnUnsupportedTypeScriptVersion: false,
    },
  },
});

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: 'if(someVar) { navigate("/"); }',
    },
    {
      code: '<Link to="/"><Button>Click me</Button></Link>',
    },
    {
      code: '<Button onClick={() =>{ navigate("/"); doSomething(); }} />',
    },
  ],
  invalid: [
    {
      code: '<Button onClick={() => navigate("/")} />',
      errors: [
        {
          messageId: 'preferLink',
        },
      ],
    },
    {
      code: '<Button onClick={() => { navigate("/");} } />',
      errors: [
        {
          messageId: 'preferLink',
        },
      ],
    },
  ],
});
