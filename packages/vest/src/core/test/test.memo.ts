import { isNull } from 'vest-utils';

import { IsolateTest } from 'IsolateTest';
import { useCurrentCursor, useSuiteId } from 'PersistedContext';
import { useTestMemoCache } from 'SuiteContext';
import { TFieldName } from 'SuiteResultTypes';
import { TestFn } from 'TestTypes';
import { VTest } from 'test';

export function wrapTestMemo(test: VTest): TestMemo<TFieldName> {
  /**
   * Caches a test result based on the test's dependencies.
   */
  function memo<F extends TFieldName>(
    fieldName: F,
    ...args: ParametersWithoutMessage
  ): IsolateTest;
  function memo<F extends TFieldName>(
    fieldName: F,
    ...args: ParametersWithMessage
  ): IsolateTest;
  function memo<F extends TFieldName>(
    fieldName: F,
    ...args: ParamsOverload
  ): IsolateTest {
    const [deps, testFn, msg] = args.reverse() as [any[], TestFn, string];

    // Implicit dependency for better specificity
    const dependencies = [useSuiteId(), fieldName, useCurrentCursor()].concat(
      deps
    );

    return getTestFromCache(dependencies, cacheAction);

    function cacheAction() {
      return test(fieldName, msg, testFn);
    }
  }

  return memo;
}

function getTestFromCache(
  dependencies: any[],
  cacheAction: () => IsolateTest
): IsolateTest {
  const cache = useTestMemoCache();

  const cached = cache.get(dependencies);

  if (isNull(cached)) {
    // cache miss
    return cache(dependencies, cacheAction);
  }

  const [, cachedValue] = cached;

  if (cachedValue.isCanceled()) {
    // cache hit, but test is canceled
    cache.invalidate(dependencies);
    return cache(dependencies, cacheAction);
  }

  IsolateTest.setNode(cachedValue);

  return cachedValue;
}

type TestMemo<F extends TFieldName> = {
  (fieldName: F, ...args: ParametersWithoutMessage): IsolateTest;
  (fieldName: F, ...args: ParametersWithMessage): IsolateTest;
};

type ParametersWithoutMessage = [test: TestFn, dependencies: unknown[]];
type ParametersWithMessage = [
  message: string,
  test: TestFn,
  dependencies: unknown[]
];

type ParamsOverload = ParametersWithoutMessage | ParametersWithMessage;
