import React, { useState, useEffect, ReactElement } from 'react';
import { Box, Text } from '@chakra-ui/react';
import network from 'src/Core/Dashboard/network';
import {
  SUFFICIENT_WORDS_GOAL,
  COMPLETE_WORDS_GOAL,
  DIALECTAL_VARIATIONS_GOAL,
  HEADWORD_AUDIO_PRONUNCIATION_GOAL,
  WORDS_WITH_NSIBIDI_GOAL,
  IS_STANDARD_IGBO_GOAL,
  EXAMPLE_SENTENCES_GOAL,
} from 'src/Core/constants';
import ProgressCard from '../ProgressCard';

const NO_PERMISSION_STATUS = 403;
const MilestoneProgress = (): ReactElement => {
  const [totalSufficientWords, setTotalSufficientWords] = useState(null);
  const [totalCompletedWords, setTotalCompletedWords] = useState(null);
  const [totalDialectalVariations, setTotalDialectalVariations] = useState(null);
  const [totalHeadwordAudioPronunciation, setTotalHeadwordAudioPronunciation] = useState(null);
  const [totalWordIsStandardIgbo, setTotalWordIsStandardIgbo] = useState(null);
  const [totalExampleSentences, setTotalExampleSentences] = useState(null);
  const [totalWordsWithNsibidi, setTotalWordsWithNsibidi] = useState(null);

  const redirectToLogin = () => {
    window.location.hash = '#/';
  };

  const handleNoPermissionStatus = ({ status }) => {
    if (status === NO_PERMISSION_STATUS) {
      redirectToLogin();
    }
  };

  useEffect(() => {
    network({ url: '/stats/words' })
      .then(({ body }) => {
        const { sufficientWordsCount, completedWordsCount, dialectalVariationsCount } = JSON.parse(body);
        setTotalSufficientWords(sufficientWordsCount || 0);
        setTotalCompletedWords(completedWordsCount || 0);
        setTotalDialectalVariations(dialectalVariationsCount || 0);
      })
      .catch(handleNoPermissionStatus);
    network({ url: '/stats/headwordAudioPronunciations' })
      .then(({ body: audioPronunciations }) => (
        setTotalHeadwordAudioPronunciation(JSON.parse(audioPronunciations).count || 0)
      ))
      .catch(handleNoPermissionStatus);
    network({ url: '/stats/isStandardIgbo' })
      .then(({ body: isStandardIgbo }) => setTotalWordIsStandardIgbo(JSON.parse(isStandardIgbo).count || 0))
      .catch(handleNoPermissionStatus);
    network({ url: '/stats/examples' })
      .then(({ body: exampleSentences }) => setTotalExampleSentences(JSON.parse(exampleSentences).count || 0))
      .catch(handleNoPermissionStatus);
    network({ url: '/stats/nsibidi' })
      .then(({ body: wordsWithNsibidi }) => setTotalWordsWithNsibidi(JSON.parse(wordsWithNsibidi).count || 0))
      .catch(handleNoPermissionStatus);
  }, []);
  return (
    <>
      <Box className="flex flex-col items-center text-center my-5">
        <Text fontSize="3xl" fontWeight="bold">Milestone Progress</Text>
        <Text fontSize="lg" className="w-11/12 lg:w-8/12 text-gray-800">
          {`We are trying to make the most robust Igbo-English dictionary. 
          Here is the progress that we've all made so far!`}
        </Text>
      </Box>
      <Box className="space-y-3 grid grid-flow-row grid-cols-1 lg:grid-cols-2 gap-4 px-3">
        <ProgressCard
          totalCount={totalSufficientWords}
          goal={SUFFICIENT_WORDS_GOAL}
          heading={'"Sufficient" Words'}
          description={`There are currently ${totalSufficientWords} "sufficient" words on the platform.
          Our goal is reach a total of ${SUFFICIENT_WORDS_GOAL} "sufficient" words.`}
          isLoaded={totalSufficientWords !== null}
        />
        <ProgressCard
          totalCount={totalCompletedWords}
          goal={COMPLETE_WORDS_GOAL}
          heading={'"Complete" Words'}
          description={`There are currently ${totalCompletedWords} "complete" words on the platform.
          Our goal is reach a total of ${COMPLETE_WORDS_GOAL} "complete" words.`}
          isLoaded={totalCompletedWords !== null}
        />
        <ProgressCard
          totalCount={totalDialectalVariations}
          goal={DIALECTAL_VARIATIONS_GOAL}
          heading="Dialectal variations"
          description={`There are currently ${totalDialectalVariations} dialectal word variations on the platform.
          Our goal is reach a total of ${DIALECTAL_VARIATIONS_GOAL} "complete" words.`}
          isLoaded={totalDialectalVariations !== null}
        />
        <ProgressCard
          totalCount={totalHeadwordAudioPronunciation}
          goal={HEADWORD_AUDIO_PRONUNCIATION_GOAL}
          heading="Headwords with Audio Pronunciations"
          description={`There are currently ${totalHeadwordAudioPronunciation} headwords 
          with audio pronunciations on the platform.
          Our next goal is to record a total of ${HEADWORD_AUDIO_PRONUNCIATION_GOAL} headwords.`}
          isLoaded={totalHeadwordAudioPronunciation !== null}
        />
        <ProgressCard
          totalCount={totalWordsWithNsibidi}
          goal={WORDS_WITH_NSIBIDI_GOAL}
          heading="Words with Nsịbịdị"
          description={`There are currently ${totalWordsWithNsibidi} words with Nsịbịdị on the platform. 
          Our next goal is to record a total of ${WORDS_WITH_NSIBIDI_GOAL} words with Nsịbịdị.`}
          isLoaded={totalWordsWithNsibidi !== null}
        />
        <ProgressCard
          totalCount={totalWordIsStandardIgbo}
          goal={IS_STANDARD_IGBO_GOAL}
          heading="Standard Igbo Words"
          description={`There are currently ${totalWordIsStandardIgbo} words marked as Standard Igbo on the platform.
          Our next goal is to mark a total of ${IS_STANDARD_IGBO_GOAL} words.`}
          isLoaded={totalWordIsStandardIgbo !== null}
        />
        <ProgressCard
          totalCount={totalExampleSentences}
          goal={EXAMPLE_SENTENCES_GOAL}
          heading="Igbo Example Sentences"
          description={`There are currently ${totalExampleSentences} example sentences on the platform.
          Our next goal is to mark a total of ${EXAMPLE_SENTENCES_GOAL} example sentences.`}
          isLoaded={totalWordIsStandardIgbo !== null}
        />
      </Box>
    </>
  );
};

export default MilestoneProgress;
