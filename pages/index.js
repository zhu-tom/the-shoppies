import {
  Banner,
  Button,
  Card,
  Icon,
  Layout,
  List,
  Page,
  Spinner,
  TextField,
  TextStyle,
} from "@shopify/polaris";
import { SearchMinor } from "@shopify/polaris-icons";
import axios from "axios";
import _ from "lodash";
import React, { useEffect, useState } from "react";

export default function Home() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [nominations, setNominations] = useState([]);

  useEffect(() => {
    setNominations(
      JSON.parse(window.localStorage.getItem("nominations")) || []
    );
  }, []);

  useEffect(() => {
    window.localStorage.setItem("nominations", JSON.stringify(nominations));
  }, [nominations]);

  const search = _.debounce((value) => {
    return axios
      .get(`https://www.omdbapi.com/?s=${value}&apikey=3371202f`)
      .catch((err) => {
        setError(err);
      })
      .then((res) => {
        if (res.data.Response === "True") {
          setResults(res.data.Search);
          setError(false);
        } else {
          setResults([]);
          setError(res.data.Error);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, 500);

  const updateResults = (value) => {
    setInputValue(value);
    setIsLoading(true);
    if (value) search(value);
    else {
      setIsLoading(false);
      setResults([]);
    }
  };

  const nominate = (obj) => {
    if (nominations.length < 5) {
      setNominations((old) => [obj, ...old]);
    }
  };

  const remove = (imdbID) => {
    setNominations((old) => old.filter((obj) => obj.imdbID !== imdbID));
  };

  return (
    <Page title="The Shoppies">
      {nominations.length === 5 && (
        <Banner title="You have nominated 5 movies!" status="success" />
      )}
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <TextField
              label="Movie title"
              onChange={updateResults}
              value={inputValue}
              prefix={<Icon source={SearchMinor} color="base" />}
              placeholder="Search"
            />
          </Card>
        </Layout.Section>
        <Layout.Section oneHalf>
          <Card
            title={`Results ${inputValue && `for "${inputValue}"`}`}
            sectioned
          >
            {isLoading ? (
              <Spinner accessibilityLabel="loading" size="small" />
            ) : (
              <List type="bullet">
                {(inputValue && error) ||
                  results.map(({ Title, Year, imdbID }) => (
                    <List.Item key={`${imdbID}-1`}>
                      <TextStyle variation="strong">{`${Title} (${Year})`}</TextStyle>
                      <Button
                        size="slim"
                        onClick={() => nominate({ Title, Year, imdbID })}
                        disabled={
                          nominations.length >= 5 ||
                          nominations.find((obj) => obj.imdbID === imdbID)
                        }
                      >
                        Nominate
                      </Button>
                    </List.Item>
                  ))}
              </List>
            )}
          </Card>
        </Layout.Section>
        <Layout.Section oneHalf>
          <Card title="Nominations" sectioned>
            <List type="bullet">
              {nominations.map(({ imdbID, Title, Year }) => (
                <List.Item key={`${imdbID}-2`}>
                  <TextStyle variation="strong">{`${Title} (${Year})`}</TextStyle>
                  <Button size="slim" onClick={() => remove(imdbID)}>
                    Remove
                  </Button>
                </List.Item>
              ))}
            </List>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
