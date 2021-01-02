import MagicString from 'magic-string';
import { createFilter } from '@rollup/pluginutils';

function escape(str) {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}

function ensureFunction(functionOrValue) {
  if (typeof functionOrValue === 'function') return functionOrValue;
  return () => functionOrValue;
}

function longest(a, b) {
  return b.length - a.length;
}

function getReplacements(options) {
  if (options.values) {
    return Object.assign({}, options.values);
  }
  const values = Object.assign({}, options);
  delete values.delimiters;
  delete values.include;
  delete values.exclude;
  delete values.sourcemap;
  delete values.sourceMap;
  delete values.replaceStage;
  return values;
}

function mapToFunctions(object) {
  return Object.keys(object).reduce((fns, key) => {
    const functions = Object.assign({}, fns);
    functions[key] = ensureFunction(object[key]);
    return functions;
  }, {});
}

function webes(options = {}) {
  const filter = createFilter(options.include, options.exclude);
  const { delimiters, replaceStage } = options;
  const functionValues = mapToFunctions(getReplacements(options));
  const keys = Object.keys(functionValues)
    .sort(longest)
    .map(escape);
  const pattern = delimiters
    ? new RegExp(`${escape(delimiters[0])}(${keys.join('|')})${escape(delimiters[1])}`, 'g')
    : new RegExp(`\\b(${keys.join('|')})\\b`, 'g');

  return {
    name: 'webes',

    renderChunk(code, chunk) {
      const id = chunk.fileName;
      if (replaceStage && replaceStage !== 'renderChunk') { return null; }
      if (!keys.length) return null;
      if (!filter(id)) return null;
      return executeReplacement(code, id);
    },

    transform(code, id) {
      if (replaceStage && replaceStage !== 'transform') { return null; }
      if (!keys.length) return null;
      if (!filter(id)) return null;
      return executeReplacement(code, id);
    }
  };

  function executeReplacement(code, id) {
    const magicString = new MagicString(code);
    if (!codeHasReplacements(code, id, magicString)) {
      return null;
    }

    const result = { code: magicString.toString() };
    if (isSourceMapEnabled()) {
      result.map = magicString.generateMap({ hires: true });
    }
    return result;
  }

  function codeHasReplacements(code, id, magicString) {
    let result = false;
    let match;

    // eslint-disable-next-line no-cond-assign
    while ((match = pattern.exec(code))) {
      result = true;

      const start = match.index;
      const end = start + match[0].length;
      const replacement = String(functionValues[match[1]](id));
      magicString.overwrite(start, end, replacement);
    }
    return result;
  }

  function isSourceMapEnabled() {
    return options.sourceMap !== false && options.sourcemap !== false;
  }
}

export default webes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9sbHVwLXBsdWdpbi13ZWJlcy5qcyIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3JvbGx1cC1wbHVnaW4td2ViZXMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE1hZ2ljU3RyaW5nIGZyb20gJ21hZ2ljLXN0cmluZyc7XG5pbXBvcnQgeyBjcmVhdGVGaWx0ZXIgfSBmcm9tICdAcm9sbHVwL3BsdWdpbnV0aWxzJztcblxuZnVuY3Rpb24gZXNjYXBlKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL1stW1xcXS97fSgpKis/LlxcXFxeJHxdL2csICdcXFxcJCYnKTtcbn1cblxuZnVuY3Rpb24gZW5zdXJlRnVuY3Rpb24oZnVuY3Rpb25PclZhbHVlKSB7XG4gIGlmICh0eXBlb2YgZnVuY3Rpb25PclZhbHVlID09PSAnZnVuY3Rpb24nKSByZXR1cm4gZnVuY3Rpb25PclZhbHVlO1xuICByZXR1cm4gKCkgPT4gZnVuY3Rpb25PclZhbHVlO1xufVxuXG5mdW5jdGlvbiBsb25nZXN0KGEsIGIpIHtcbiAgcmV0dXJuIGIubGVuZ3RoIC0gYS5sZW5ndGg7XG59XG5cbmZ1bmN0aW9uIGdldFJlcGxhY2VtZW50cyhvcHRpb25zKSB7XG4gIGlmIChvcHRpb25zLnZhbHVlcykge1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zLnZhbHVlcyk7XG4gIH1cbiAgY29uc3QgdmFsdWVzID0gT2JqZWN0LmFzc2lnbih7fSwgb3B0aW9ucyk7XG4gIGRlbGV0ZSB2YWx1ZXMuZGVsaW1pdGVycztcbiAgZGVsZXRlIHZhbHVlcy5pbmNsdWRlO1xuICBkZWxldGUgdmFsdWVzLmV4Y2x1ZGU7XG4gIGRlbGV0ZSB2YWx1ZXMuc291cmNlbWFwO1xuICBkZWxldGUgdmFsdWVzLnNvdXJjZU1hcDtcbiAgZGVsZXRlIHZhbHVlcy5yZXBsYWNlU3RhZ2U7XG4gIHJldHVybiB2YWx1ZXM7XG59XG5cbmZ1bmN0aW9uIG1hcFRvRnVuY3Rpb25zKG9iamVjdCkge1xuICByZXR1cm4gT2JqZWN0LmtleXMob2JqZWN0KS5yZWR1Y2UoKGZucywga2V5KSA9PiB7XG4gICAgY29uc3QgZnVuY3Rpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgZm5zKTtcbiAgICBmdW5jdGlvbnNba2V5XSA9IGVuc3VyZUZ1bmN0aW9uKG9iamVjdFtrZXldKTtcbiAgICByZXR1cm4gZnVuY3Rpb25zO1xuICB9LCB7fSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHdlYmVzKG9wdGlvbnMgPSB7fSkge1xuICBjb25zdCBmaWx0ZXIgPSBjcmVhdGVGaWx0ZXIob3B0aW9ucy5pbmNsdWRlLCBvcHRpb25zLmV4Y2x1ZGUpO1xuICBjb25zdCB7IGRlbGltaXRlcnMsIHJlcGxhY2VTdGFnZSB9ID0gb3B0aW9ucztcbiAgY29uc3QgZnVuY3Rpb25WYWx1ZXMgPSBtYXBUb0Z1bmN0aW9ucyhnZXRSZXBsYWNlbWVudHMob3B0aW9ucykpO1xuICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoZnVuY3Rpb25WYWx1ZXMpXG4gICAgLnNvcnQobG9uZ2VzdClcbiAgICAubWFwKGVzY2FwZSk7XG4gIGNvbnN0IHBhdHRlcm4gPSBkZWxpbWl0ZXJzXG4gICAgPyBuZXcgUmVnRXhwKGAke2VzY2FwZShkZWxpbWl0ZXJzWzBdKX0oJHtrZXlzLmpvaW4oJ3wnKX0pJHtlc2NhcGUoZGVsaW1pdGVyc1sxXSl9YCwgJ2cnKVxuICAgIDogbmV3IFJlZ0V4cChgXFxcXGIoJHtrZXlzLmpvaW4oJ3wnKX0pXFxcXGJgLCAnZycpO1xuXG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3dlYmVzJyxcblxuICAgIHJlbmRlckNodW5rKGNvZGUsIGNodW5rKSB7XG4gICAgICBjb25zdCBpZCA9IGNodW5rLmZpbGVOYW1lO1xuICAgICAgaWYgKHJlcGxhY2VTdGFnZSAmJiByZXBsYWNlU3RhZ2UgIT09ICdyZW5kZXJDaHVuaycpIHsgcmV0dXJuIG51bGw7IH1cbiAgICAgIGlmICgha2V5cy5sZW5ndGgpIHJldHVybiBudWxsO1xuICAgICAgaWYgKCFmaWx0ZXIoaWQpKSByZXR1cm4gbnVsbDtcbiAgICAgIHJldHVybiBleGVjdXRlUmVwbGFjZW1lbnQoY29kZSwgaWQpO1xuICAgIH0sXG5cbiAgICB0cmFuc2Zvcm0oY29kZSwgaWQpIHtcbiAgICAgIGlmIChyZXBsYWNlU3RhZ2UgJiYgcmVwbGFjZVN0YWdlICE9PSAndHJhbnNmb3JtJykgeyByZXR1cm4gbnVsbDsgfVxuICAgICAgaWYgKCFrZXlzLmxlbmd0aCkgcmV0dXJuIG51bGw7XG4gICAgICBpZiAoIWZpbHRlcihpZCkpIHJldHVybiBudWxsO1xuICAgICAgcmV0dXJuIGV4ZWN1dGVSZXBsYWNlbWVudChjb2RlLCBpZCk7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIGV4ZWN1dGVSZXBsYWNlbWVudChjb2RlLCBpZCkge1xuICAgIGNvbnN0IG1hZ2ljU3RyaW5nID0gbmV3IE1hZ2ljU3RyaW5nKGNvZGUpO1xuICAgIGlmICghY29kZUhhc1JlcGxhY2VtZW50cyhjb2RlLCBpZCwgbWFnaWNTdHJpbmcpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHQgPSB7IGNvZGU6IG1hZ2ljU3RyaW5nLnRvU3RyaW5nKCkgfTtcbiAgICBpZiAoaXNTb3VyY2VNYXBFbmFibGVkKCkpIHtcbiAgICAgIHJlc3VsdC5tYXAgPSBtYWdpY1N0cmluZy5nZW5lcmF0ZU1hcCh7IGhpcmVzOiB0cnVlIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gY29kZUhhc1JlcGxhY2VtZW50cyhjb2RlLCBpZCwgbWFnaWNTdHJpbmcpIHtcbiAgICBsZXQgcmVzdWx0ID0gZmFsc2U7XG4gICAgbGV0IG1hdGNoO1xuXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbmQtYXNzaWduXG4gICAgd2hpbGUgKChtYXRjaCA9IHBhdHRlcm4uZXhlYyhjb2RlKSkpIHtcbiAgICAgIHJlc3VsdCA9IHRydWU7XG5cbiAgICAgIGNvbnN0IHN0YXJ0ID0gbWF0Y2guaW5kZXg7XG4gICAgICBjb25zdCBlbmQgPSBzdGFydCArIG1hdGNoWzBdLmxlbmd0aDtcbiAgICAgIGNvbnN0IHJlcGxhY2VtZW50ID0gU3RyaW5nKGZ1bmN0aW9uVmFsdWVzW21hdGNoWzFdXShpZCkpO1xuICAgICAgbWFnaWNTdHJpbmcub3ZlcndyaXRlKHN0YXJ0LCBlbmQsIHJlcGxhY2VtZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzU291cmNlTWFwRW5hYmxlZCgpIHtcbiAgICByZXR1cm4gb3B0aW9ucy5zb3VyY2VNYXAgIT09IGZhbHNlICYmIG9wdGlvbnMuc291cmNlbWFwICE9PSBmYWxzZTtcbiAgfVxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHQSxTQUFTLE1BQU0sQ0FBQyxHQUFHLEVBQUU7QUFDckIsRUFBRSxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDdEQsQ0FBQztBQUNEO0FBQ0EsU0FBUyxjQUFjLENBQUMsZUFBZSxFQUFFO0FBQ3pDLEVBQUUsSUFBSSxPQUFPLGVBQWUsS0FBSyxVQUFVLEVBQUUsT0FBTyxlQUFlLENBQUM7QUFDcEUsRUFBRSxPQUFPLE1BQU0sZUFBZSxDQUFDO0FBQy9CLENBQUM7QUFDRDtBQUNBLFNBQVMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDdkIsRUFBRSxPQUFPLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUM3QixDQUFDO0FBQ0Q7QUFDQSxTQUFTLGVBQWUsQ0FBQyxPQUFPLEVBQUU7QUFDbEMsRUFBRSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7QUFDdEIsSUFBSSxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QyxHQUFHO0FBQ0gsRUFBRSxNQUFNLE1BQU0s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