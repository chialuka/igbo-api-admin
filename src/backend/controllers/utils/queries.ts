import { has, omit } from 'lodash';
import { LOOK_BACK_DATE } from 'src/backend/shared/constants/emailDates';
import createRegExp from 'src/backend/shared/utils/createRegExp';
import SuggestionSource from 'src/backend/shared/constants/SuggestionSource';
import ExampleStyle from 'src/backend/shared/constants/ExampleStyle';

type ExampleSearchQuery = [
  { igbo: RegExp },
  { english: RegExp },
];

type Filters = {
  $expr?: any,
  $or?: any[],
  attributes?: {
    isStandardIgbo?: { $eq: boolean },
  },
  source?: any,
  authorId?: any,
  style?: any,
  wordClass?: any,
};

const generateSearchFilters = (filters: { [key: string]: string }): { [key: string]: any } => {
  let searchFilters: Filters = filters ? Object.entries(filters).reduce((allFilters: Filters, [key, value]) => {
    allFilters.$or = allFilters.$or || [];
    switch (key) {
      case 'isStandardIgbo':
        allFilters['attributes.isStandardIgbo'] = { $eq: !!value };
        break;
      case 'pronunciation':
        if (value) {
          allFilters.$expr = { $gt: [{ $strLenCP: '$pronunciation' }, 10] };
        } else {
          allFilters.$or = [...allFilters.$or, { pronunciation: { $eq: null } }, { pronunciation: { $eq: '' } }];
        }
        break;
      case SuggestionSource.COMMUNITY:
        allFilters.source = { $eq: SuggestionSource.COMMUNITY };
        break;
      case SuggestionSource.INTERNAL:
        allFilters.$or = [
          ...allFilters.$or,
          { source: { $eq: SuggestionSource.INTERNAL } }, { source: { $exists: false } },
        ];
        break;
      case 'authorId':
        allFilters.authorId = { $eq: value };
        break;
      case 'example':
        allFilters.$or = [...allFilters.$or, { igbo: new RegExp(value) }, { english: new RegExp(value) }];
        break;
      case 'isProverb':
        allFilters.style = { $eq: ExampleStyle.PROVERB.value };
        break;
      case 'wordClass':
        allFilters.wordClass = { $in: value };
        break;
      default:
        return allFilters;
    };
    return allFilters;
  }, {}) : {};
  if (has(searchFilters, '$or') && !searchFilters.$or.length) {
    searchFilters = omit(searchFilters, '$or');
  }
  return searchFilters;
};

const wordQuery = (regex: RegExp): { word: { $regex: RegExp } } => ({ word: { $regex: regex } });
const fullTextSearchQuery = (
  keyword: string,
): { word?: { $regex: RegExp }, $text?: { $search: string } } => (
  !keyword
    ? { word: { $regex: /./ } }
    : { $text: { $search: keyword } }
);
const variationsQuery = (regex: RegExp): { variations: { $in: [RegExp] } } => ({ variations: { $in: [regex] } });
const definitionsQuery = (regex: RegExp): { definitions: { $in: [RegExp] } } => ({ definitions: { $in: [regex] } });
const hostsQuery = (host: string): { hosts: { $in: [string] } } => ({ hosts: { $in: [host] } });

/* Regex match query used to later to defined the Content-Range response header */
export const searchExamplesRegexQuery = (
  regex: RegExp,
  filters: { [key: string]: string },
): { $or: ExampleSearchQuery } => (
  {
    $or: [{ igbo: regex }, { english: regex }],
    ...(filters ? generateSearchFilters(filters) : {}),
  }
);
export const searchExampleSuggestionsRegexQuery = (
  regex: RegExp,
  filters: { [key: string]: string },
): {
  $or: ExampleSearchQuery,
  exampleForSuggestion: boolean,
  merged: null,
} => ({
  $or: [{ igbo: regex }, { english: regex }],
  exampleForSuggestion: false,
  merged: null,
  ...(filters ? generateSearchFilters(filters) : {}),
});
export const searchPreExistingExampleSuggestionsRegexQuery = (
  { igbo, english, associatedWordId }: { igbo: string, english: string, associatedWordId: string },
): any => ({
  igbo,
  english,
  associatedWords: associatedWordId,
  originalExampleId: null,
  merged: null,
});
export const searchPreExistingWordSuggestionsRegexQuery = (
  regex: RegExp,
  filters?: { [key: string]: string },
): {
    $or: (
    { word: { $regex: RegExp } } | { variations: { $in: [RegExp] } }
    )[],
    merged: null,
  } => ({
  $or: [wordQuery(regex), variationsQuery(regex)],
  merged: null,
  ...(filters ? generateSearchFilters(filters) : {}),
});
export const searchPreExistingGenericWordsRegexQueryAsEditor = (
  segmentRegex: RegExp,
  regex: RegExp,
): { $or: { $and: any[] }[], merged: null } => ({
  $or: [
    { $and: [wordQuery(regex), { word: { $regex: segmentRegex } }] },
    { $and: [variationsQuery(regex), { variations: { $regex: segmentRegex } }] },
    { $and: [definitionsQuery(regex), { word: { $regex: segmentRegex } }] },
  ],
  merged: null,
});
export const searchPreExistingGenericWordsRegexQuery = (regex: RegExp): { $or: any[], merged: null } => ({
  $or: [wordQuery(regex), variationsQuery(regex), definitionsQuery(regex)],
  merged: null,
});
export const searchIgboTextSearch = (
  keyword: string,
  filters?: { [key: string]: string },
): { [key: string]: any } => ({
  ...fullTextSearchQuery(keyword),
  ...(filters ? generateSearchFilters(filters) : {}),
});
/* Since the word field is not non-accented yet,
 * a strict regex search for words has to be used as a workaround */
export const strictSearchIgboQuery = (word: string): { word: RegExp } => ({
  word: createRegExp(word, true),
});
export const searchEnglishRegexQuery = (
  keyword: RegExp,
  filters?: { [key: string]: string },
): { [key: string]: any } => ({
  ...definitionsQuery(keyword),
  ...(filters ? generateSearchFilters(filters) : {}),
});
export const searchForLastWeekQuery = (): {
  updatedAt: { [key: string]: number },
  merged: { [key: string]: null },
} => ({
  updatedAt: { $gte: LOOK_BACK_DATE.valueOf() },
  merged: { $ne: null },
});
export const searchDeveloperWithHostsQuery = hostsQuery;
export const searchForAllWordsWithAudioPronunciations = (): { pronunciation: any, $expr: any } => ({
  pronunciation: { $exists: true },
  $expr: { $gt: [{ $strLenCP: '$pronunciation' }, 10] },
});
export const searchForAllWordsWithIsStandardIgbo = (): { attributes: { isStandardIgbo: boolean } } => ({
  // @ts-ignore
  'attributes.isStandardIgbo': true,
});
export const searchForAllWordsWithNsibidi = (): { nsibidi: { $ne: string } } => ({
  nsibidi: { $ne: '' },
});
export const searchForAssociatedSuggestions = (wordId: string): {
  originalWordId: string,
  merged: { [key: string]: null }
} => ({
  originalWordId: wordId,
  merged: { $eq: null },
});
