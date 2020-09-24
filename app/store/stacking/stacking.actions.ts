import { createAsyncThunk } from '@reduxjs/toolkit';
import { selectActiveNodeApi } from '../stacks-node/stacks-node.reducer';
import { RootState } from '@store/index';
import { Api } from '@api/api';
import { Configuration, InfoApi } from '@stacks/blockchain-api-client';
import fetch from 'cross-fetch';

const createApi = (url: string) => {
  const config = new Configuration({
    fetchApi: fetch,
    basePath: url,
  });
  return new InfoApi(config);
};

export const fetchStackingInfo = createAsyncThunk('stacking/details', async (_arg, thunkApi) => {
  const state = thunkApi.getState() as RootState;
  const network = selectActiveNodeApi(state);
  const resp = await new Api(network.url).getPoxInfo();
  return resp.data;
});

export const fetchCoreDetails = createAsyncThunk(
  'stacking/core-node-details',
  async (_arg, thunkApi) => {
    const state = thunkApi.getState() as RootState;
    const network = selectActiveNodeApi(state);
    const api = createApi(network.url);
    return api.getCoreApiInfo();
  }
);

export const fetchBlocktimeInfo = createAsyncThunk(
  'stacking/block-time-details',
  async (_arg, thunkApi) => {
    const state = thunkApi.getState() as RootState;
    const network = selectActiveNodeApi(state);
    const api = createApi(network.url);
    return api.getNetworkBlockTimes();
  }
);