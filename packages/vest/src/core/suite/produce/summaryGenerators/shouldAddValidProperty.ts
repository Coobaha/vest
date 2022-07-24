import { isNotEmpty, isEmpty } from 'vest-utils';

import { Severity } from 'Severity';
import VestTest from 'VestTest';
import {
  hasErrorsByTestObjects,
  hasGroupFailuresByTestObjects,
} from 'hasFailuresByTestObjects';
import { nonMatchingFieldName } from 'matchingFieldName';
import { nonMatchingGroupName } from 'matchingGroupName';
import { optionalFiedIsApplied, OptionalFieldTypes } from 'optionalFields';
import { useTestsFlat, useAllIncomplete, useOptionalField } from 'stateHooks';

// eslint-disable-next-line max-statements, complexity
export function shouldAddValidProperty(fieldName?: string): boolean {
  // Is the field optional, and the optional condition is applied
  if (optionalFiedIsApplied(fieldName)) {
    return true;
  }

  const testObjects = useTestsFlat();

  // Are there no tests?
  if (isEmpty(testObjects)) {
    return false;
  }

  // Does the field have any tests with errors?
  if (hasErrorsByTestObjects(fieldName)) {
    return false;
  }

  // Does the given field have any pending tests that are not optional?
  if (hasNonOptionalIncomplete(fieldName)) {
    return false;
  }

  // Does the field have no missing tests?
  return noMissingTests(fieldName);
}

export function shouldAddValidPropertyInGroup(
  groupName: string,
  fieldName: string
): boolean {
  if (optionalFiedIsApplied(fieldName)) {
    return true;
  }

  if (hasGroupFailuresByTestObjects(Severity.ERRORS, groupName, fieldName)) {
    return false;
  }

  // Do the given group/field have any pending tests that are not optional?
  if (hasNonOptionalIncompleteByGroup(groupName, fieldName)) {
    return false;
  }

  return noMissingTestsByGroup(groupName, fieldName);
}

// Does the given field have any pending tests that are not optional?
function hasNonOptionalIncomplete(fieldName?: string) {
  return isNotEmpty(
    useAllIncomplete().filter(testObject =>
      isTestObjectOptional(testObject, fieldName)
    )
  );
}

// Do the given group/field have any pending tests that are not optional?
function hasNonOptionalIncompleteByGroup(groupName: string, fieldName: string) {
  return isNotEmpty(
    useAllIncomplete().filter(testObject => {
      if (nonMatchingGroupName(testObject, groupName)) {
        return false;
      }

      return isTestObjectOptional(testObject, fieldName);
    })
  );
}

function isTestObjectOptional(
  testObject: VestTest,
  fieldName?: string
): boolean {
  if (nonMatchingFieldName(testObject, fieldName)) {
    return false;
  }

  return optionalFiedIsApplied(fieldName);
}

// Did all of the tests for the provided field run/omit?
// This makes sure that the fields are not skipped or pending.
function noMissingTests(fieldName?: string): boolean {
  const testObjects = useTestsFlat();

  return testObjects.every(testObject =>
    noMissingTestsLogic(testObject, fieldName)
  );
}

// Does the group have no missing tests?
function noMissingTestsByGroup(groupName: string, fieldName?: string): boolean {
  const testObjects = useTestsFlat();

  return testObjects.every(testObject => {
    if (nonMatchingGroupName(testObject, groupName)) {
      return true;
    }

    return noMissingTestsLogic(testObject, fieldName);
  });
}

// Does the object qualify as either tested or omitted (but not skipped!)
function noMissingTestsLogic(
  testObject: VestTest,
  fieldName?: string
): boolean {
  if (nonMatchingFieldName(testObject, fieldName)) {
    return true;
  }

  return (
    useOptionalField(testObject.fieldName).type ===
      OptionalFieldTypes.Delayed ||
    testObject.isTested() ||
    testObject.isOmitted()
  );
}
