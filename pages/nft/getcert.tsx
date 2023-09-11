/* eslint-disable @next/next/no-img-element */

import type { NextPage } from 'next'
import { ChangeEvent, useState } from 'react';
import { BaseLayout } from '@ui'
import { Switch } from '@headlessui/react'
import Link from 'next/link'
import { NftMeta, PinataRes } from '@_types/nft';
import axios from 'axios';
import { useWeb3 } from '@providers/web3';
import { Signer, ethers } from 'ethers';
import { toast } from "react-toastify";
import { useNetwork } from '@hooks/web3';
import { ExclamationIcon } from '@heroicons/react/solid';

const ALLOWED_FIELDS = ["name", "description", "image", "attributes"];

const RWAssetCreate: NextPage = () => {
  const { ethereum, contract } = useWeb3();
  const { network } = useNetwork();
  const [nftURI, setNftURI] = useState("");
  const [price, setPrice] = useState("");
  const [hasURI, setHasURI] = useState(false);
  

  const getSignedData = async () => {
    const messageToSign = await axios.get("/api/verify");
    const accounts = await ethereum?.request({ method: "eth_requestAccounts" }) as string[];
    const account = accounts[0];

    const signedData = await ethereum?.request({
      method: "personal_sign",
      params: [JSON.stringify(messageToSign.data), account, messageToSign.data.id]
    })

    return { signedData, account };
  }


  const handleImage = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      console.error("Select a file");
      return;
    }

    const file = e.target.files[0];
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    try {
      const { signedData, account } = await getSignedData();
      const promise = axios.post("/api/verify-image", {
        address: account,
        signature: signedData,
        bytes,
        contentType: file.type,
        fileName: file.name.replace(/\.[^/.]+$/, "")
      });

      const res = await toast.promise(
        promise, {
        pending: "Uploading image",
        success: "Image uploaded",
        error: "Image upload error"
      }
      )

      const data = res.data as PinataRes;

      
    } catch (e: any) {
      console.error(e.message);
    }
  }


  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
  }

  const handleAttributeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
   
  }

  const uploadMetadata = async () => {
    try {
      const { signedData, account } = await getSignedData();

      const promise = axios.post("/api/verify", {
        address: account,
        signature: signedData,
      
      })

      const res = await toast.promise(
        promise, {
        pending: "Uploading digital asset",
        success: "Digital asset uploaded",
        error: "Digital asset upload error"
      }
      )
      const data = res.data as PinataRes;
      setNftURI(`${process.env.NEXT_PUBLIC_PINATA_DOMAIN}/ipfs/${data.IpfsHash}`);
    } catch (e: any) {
      console.error(e.message);
    }
  }

  const createNft = async () => {
    try {
      //const nftRes = await axios.get(nftURI);
      const nftRes = await axios.get(nftURI, {
        headers: { "Accept": "text/plain" }
      });
      const content = nftRes.data;

      Object.keys(content).forEach(key => {
        if (!ALLOWED_FIELDS.includes(key)) {
          throw new Error("Invalid Json structure");
        }
      })

      const tx = await contract?.mintRWAsset(
        nftURI,
        ethers.utils.parseEther(price), {
        value: ethers.utils.parseEther(0.0016.toString())
      }
      );

      await toast.promise(
        tx!.wait(), {
        pending: "Minting token",
        success: "Token minted",
        error: "Token mint error"
      }
      );

//      return (
//        <BaseLayout>
//          <div className="rounded-md bg-yellow-50 p-4 mt-10">
//            <div className="flex">
//              <div className="flex-shrink-0">
//                <ExclamationIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
//              </div>
//              <div className="ml-3">
//                <h3 className="text-sm font-medium text-yellow-800">All done!</h3>
//              </div>
//            </div>
//          </div>
//        </BaseLayout>
//      )

    } catch (e: any) {
      console.error(e.message);
    }
  }

  if (!network.isConnectedToNetwork) {
    return (
      <BaseLayout>
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
                  {network.isLoading ?
                    "Loading..." :
                    `Connect to ${network.targetNetwork}`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout>
      <div>
        <div className="py-4">
          {!nftURI &&
            <div className="flex">
              <div className="mr-2 font-bold underline">Was your Bonsai certificated?</div>
              <Switch
                checked={hasURI}
                onChange={() => setHasURI(!hasURI)}
                className={`${hasURI ? 'bg-indigo-900' : 'bg-indigo-700'}
                  relative inline-flex flex-shrink-0 h-[28px] w-[64px] border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
              >
                <span className="sr-only">Use setting</span>
                <span
                  aria-hidden="true"
                  className={`${hasURI ? 'translate-x-9' : 'translate-x-0'}
                    pointer-events-none inline-block h-[24px] w-[24px] rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200`}
                />
              </Switch>
            </div>
          }
        </div>
        {(nftURI || hasURI) ?
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Bonsai DAO</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Voting, certificating and getting reward.
                </p>
              </div>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <form>
                <div className="shadow sm:rounded-md sm:overflow-hidden">
                <h2 className="text-3xl tracking-tight font-extrabold text-lime-900 sm:text-4xl">Reserve for Bonsai Certificated.</h2>
                  <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                    <button
                      
                      type="button"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Vote for Cert
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          :
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <div className="px-4 sm:px-0">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Choose the Bonsai to get certification!</h3>
                <p className="mt-1 text-sm text-gray-600">
                  This information will be displayed publicly so be careful what you share.
                </p>
              </div>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <form>
                <div className="shadow sm:rounded-md sm:overflow-hidden">
                  <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                    <h2 className="text-3xl tracking-tight font-extrabold text-lime-900 sm:text-4xl">Reserve for Bonsai DAO listing.</h2>
                    
                    {/* Has Image? */}
                  
                    <div className="grid grid-cols-6 gap-6">
                      
                    </div>
                    <p className="text-sm !mt-2 text-gray-500">
                    Bonsai origin information.
                    </p>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                    <button
                     
                      type="button"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Getting Certification
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        }
      </div>
    </BaseLayout>
  )
}

export default RWAssetCreate