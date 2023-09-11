/* eslint-disable @next/next/no-img-element */

import type { NextPage } from 'next';
import { BaseLayout, NftList } from '@ui';
import { useNetwork } from '@hooks/web3';
import { ExclamationIcon } from '@heroicons/react/solid';

const Home: NextPage = () => {
  const { network } = useNetwork();
  return (
    <BaseLayout>
      <div className="relative bg-gray-50 pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
        <div className="absolute inset-0">
          <div className="bg-white h-1/3 sm:h-2/3" />
        </div>
        <div className="relative">    
          <div className="flex text-center justify-content-center">
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            <img
                className="hidden lg:block h-300 w-auto justify-content-center"
                src="/images/real-world-asset-sgw.jpg"
                alt="Workflow"
            />
            </p>
          </div>
          { network.isConnectedToNetwork ?
            <NftList /> :
            <div className="rounded-md bg-yellow-50 p-4 mt-10">
              <div className="flex">
                <div className="ml-3">
                  <img
                    className="hidden lg:block h-10 w-auto"
                    src="/images/small-klaytn.png"
                    alt="Workflow"
                  />
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                    { network.isLoading ?
                      "Loading..." :
                      `Connect to ${network.targetNetwork}`
                    }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </BaseLayout>
  )
}

export default Home