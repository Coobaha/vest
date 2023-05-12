import { dummyTest } from '../../../../testUtils/testDummy';

import { Modes } from 'mode';
import { TTestSuite } from 'testUtils/TVestMock';
import { create, group } from 'vest';
import * as vest from 'vest';

const modes = ['SuiteRunResult', 'SuiteResult'];

describe.each(modes)('produce method: %s', mode => {
  let suite: TTestSuite;

  function getRes(...args: any[]) {
    const res = suite(...args);
    return mode === 'SuiteRunResult' ? res : suite.get();
  }

  describe(`${mode}->getErrorsByGroup`, () => {
    describe('When no tests', () => {
      beforeEach(() => {
        suite = create(() => {});
      });
      describe('When no fieldName passed', () => {
        it('Should return an object with empty message arrays', () => {
          expect(getRes().getErrorsByGroup('group_name')).toEqual({});
        });
      });
      describe('When fieldName passed', () => {
        it('Should return an empty array', () => {
          expect(getRes().getErrorsByGroup('group_name', 'field_name')).toEqual(
            []
          );
        });
      });
    });

    describe('When no failures', () => {
      describe('When no fieldName passed', () => {
        it('Should return an object with empty message arrays', () => {
          suite = create(() => {
            vest.mode(Modes.ALL);
            dummyTest.passing('field_1', 'message', 'group_name');
            dummyTest.passing('f2');
          });
          expect(getRes().getErrorsByGroup('group_name')).toEqual({});
        });
      });
      describe('When fieldName passed', () => {
        it('Should return an empty array', () => {
          suite = create(() => {
            vest.mode(Modes.ALL);
            dummyTest.passing('field_1', 'message', 'group_name');
            dummyTest.passing();
          });
          expect(getRes().getErrorsByGroup('group_name', 'field_name')).toEqual(
            []
          );
        });
      });
    });

    describe('When there are failures', () => {
      describe('When no fieldName passed', () => {
        it('Should return an object containing the error messages of each group', () => {
          suite = create(() => {
            vest.mode(Modes.ALL);
            dummyTest.failing('field_1', 'message_1', 'group_name');
            dummyTest.failing('field_1', 'message_2');
            dummyTest.failing('field_2');
            dummyTest.failing('field_2', 'message_3', 'group_name');
            dummyTest.failing('field_2', 'message_4', 'group_name');
            dummyTest.failing('field_2', 'message_4', 'group_name_2');
            dummyTest.passing('field_1');
            dummyTest.passing('field_2');
            dummyTest.passing('field_3');
          });
          expect(getRes().getErrorsByGroup('group_name')).toEqual({
            field_1: ['message_1'],
            field_2: ['message_3', 'message_4'],
          });
        });
      });
      describe('When fieldName passed', () => {
        it("Should return an array of the field's error messages", () => {
          suite = create(() => {
            vest.mode(Modes.ALL);
            group('group_name', () => {
              vest.test('field_1', 'message_1', () => false);
              vest.test('field_2', 'message_3', () => false);
            });
            vest.test('field_1', 'message_2', () => false);
            vest.test('field_2', () => false);
            vest.test('field_1', () => {});
            vest.test('field_2', () => {});
            vest.test('field_3', () => {});
          });
          expect(getRes().getErrorsByGroup('group_name', 'field_1')).toEqual(
            {}
          );
          expect(getRes().getErrorsByGroup('group_name', 'field_2')).toEqual(
            {}
          );
        });
      });
    });
  });
  describe(`${mode}->getWarningsByGroup`, () => {
    describe('When no tests', () => {
      beforeEach(() => {
        suite = create(() => {});
      });
      describe('When no fieldName passed', () => {
        it('Should return an object with empty message arrays', () => {
          expect(getRes().getWarningsByGroup('group_name')).toEqual({});
        });
      });
      describe('When fieldName passed', () => {
        it('Should return an empty array', () => {
          expect(
            getRes().getWarningsByGroup('group_name', 'field_name')
          ).toEqual([]);
        });
      });
    });

    describe('When no failures', () => {
      describe('When no fieldName passed', () => {
        it('Should return an object with no message arrays', () => {
          suite = create(() => {
            vest.mode(Modes.ALL);
            dummyTest.passing('field_1', 'message', 'group_name');
            dummyTest.passing();
          });
          expect(getRes().getWarningsByGroup('group_name')).toEqual({});
        });
      });
      describe('When fieldName passed', () => {
        it('Should return an empty array', () => {
          suite = create(() => {
            vest.mode(Modes.ALL);
            dummyTest.passing('field_1', 'message', 'group_name');
            dummyTest.passing();
          });
          expect(
            getRes().getWarningsByGroup('group_name', 'field_name')
          ).toEqual([]);
        });
      });
    });

    describe('When there are failures', () => {
      describe('When no fieldName passed', () => {
        it('Should return an object containing the warning messages of each group', () => {
          suite = create(() => {
            vest.mode(Modes.ALL);
            dummyTest.failingWarning('field_1', 'message_1', 'group_name');
            dummyTest.failingWarning('field_1', 'message_2');
            dummyTest.failingWarning('field_2');
            dummyTest.failingWarning('field_2', 'message_3', 'group_name');
            dummyTest.failingWarning('field_2', 'message_4', 'group_name');
            dummyTest.failingWarning('field_2', 'message_4', 'group_name_2');
            dummyTest.passing('field_1');
            dummyTest.passing('field_2');
            dummyTest.passing('field_3');
          });
          expect(getRes().getWarningsByGroup('group_name')).toEqual([
            {
              fieldName: 'field_2',
              groupName: 'group_name',
              message: 'message_3',
            },
            {
              fieldName: 'field_2',
              groupName: 'group_name',
              message: 'message_4',
            },
          ]);
        });
      });
      describe('When fieldName passed', () => {
        it("Should return an array of the field's warning messages", () => {
          suite = create(() => {
            vest.mode(Modes.ALL);
            group('group_name', () => {
              vest.test('field_1', 'message_1', () => {
                vest.warn();
                return false;
              });
              vest.test('field_2', 'message_3', () => {
                vest.warn();
                return false;
              });
            });
            vest.test('field_1', 'message_2', () => {
              vest.warn();
              return false;
            });
            vest.test('field_2', () => {
              vest.warn();
              return false;
            });
            vest.test('field_1', () => {});
            vest.test('field_2', () => {});
            vest.test('field_3', () => {});
          });
          expect(getRes().getWarningsByGroup('group_name', 'field_1')).toEqual(
            {}
          );
          expect(getRes().getWarningsByGroup('group_name', 'field_2')).toEqual(
            {}
          );
        });
      });
    });
  });
});
