import { IWeb3Provider } from '@src/providers/web3/types';
import { AnyJsonRpc, ExtractResponse } from 'eth-rpc-types/primitives';
import { BaseClient } from '../rpc/client';
import { Web3Requests } from './requests';

export class Web3Client extends BaseClient {
  private readonly provider: IWeb3Provider;

  constructor() {
    super('web3'); // initialized with fake endpoint
    this.provider = (window as any).web3.currentProvider;
  }

  public decorateRequest = (
    req: ReturnType<Web3Requests[keyof Web3Requests]>,
  ) => ({
    ...req,
    id: this.id(),
    jsonrpc: '2.0',
    params: req.params || [], // default to empty array so MetaMask doesn't error
  });

  public call = (
    request: ReturnType<Web3Requests[keyof Web3Requests]>,
  ): Promise<ExtractResponse<AnyJsonRpc>> =>
    this.sendAsync(this.decorateRequest(request)) as Promise<
      ExtractResponse<AnyJsonRpc>
    >;

  public batch = (
    requests: ReturnType<Web3Requests[keyof Web3Requests]>[],
  ): Promise<ExtractResponse<AnyJsonRpc>[]> =>
    this.sendAsync(requests.map(this.decorateRequest)) as Promise<
      ExtractResponse<AnyJsonRpc>[]
    >;

  private readonly sendAsync = (
    request: any,
  ): Promise<ExtractResponse<AnyJsonRpc> | ExtractResponse<AnyJsonRpc>[]> => {
    return new Promise((resolve, reject) => {
      this.provider.sendAsync(
        request,
        (
          error,
          result: ExtractResponse<AnyJsonRpc> | ExtractResponse<AnyJsonRpc>[],
        ) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        },
      );
    });
  };
}
