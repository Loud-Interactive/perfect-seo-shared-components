'use client';

import { useEffect, useState } from 'react';
import * as Tabs from "@radix-ui/react-tabs";
import { useSelector } from 'react-redux';
import { RootState } from '@/perfect-seo-shared-components/lib/store';
import { signIn } from 'next-auth/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FactCheckPerfectLogo } from '@/perfect-seo-shared-components/assets/brandIcons';
import { PostProps } from '@/perfect-seo-shared-components/data/types';

// onNewFactCheck: (factCheck: { type: 'url' | 'file', content: string }, post_id?: string) => void;

interface FactCheckModalProps {
  post: PostProps,
  refresh: () => void
}
const FactCheckModal = ({ post, refresh }: FactCheckModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn, profile } = useSelector((state: RootState) => state);
  const pathname = usePathname()
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlParam = searchParams.get('url');
  const guidParam = searchParams.get('post_guid');

  useEffect(() => {
    if (urlParam && profile) {
      let guid = guidParam.toString()
      router.replace(pathname)
      setUrl(urlParam)
      return handleUrlCheck(urlParam.toString(), guid)
    }
  }, [urlParam, profile])

  const handleUrlCheck = (selectUrl?, guid?) => {
    if (!selectUrl && !url) return setError("Please enter a URL to fact-check");
    let newUrl = selectUrl ? selectUrl : url;

    // onNewFactCheck({ type: 'url', content: newUrl }, guid);
    setUrl('');
  };

  const handleFileCheck = () => {
    if (!file) return setError("Please select a file to upload");
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      // onNewFactCheck({ type: 'file', content });
      setFile(null);
    };
    reader.readAsText(file);
  };

  const loginHandler = (e) => {
    e.preventDefault();
    signIn('google');
  }

  return (
    <div className="card p-3">
      <div className='row d-flex g-3'>
        <div className='col-12'>
          <div className='d-flex justify-content-center'>
            <div className='brand-logo'>
              <FactCheckPerfectLogo />
            </div>
          </div>
        </div>
        <div className='col-12'>
          <h4 className="text-center">Factcheck your post using factcheckPerfect
          </h4>
        </div>
        <div className='col-12'>
          <p className="text-center">What source would you like to use to run your factcheck?</p>
          <Tabs.Root defaultValue="url" className="w-100">
            <Tabs.List className='d-flex align-items-center justify-content-center px-0'>
              <Tabs.Trigger className="col-auto pe-4 btn btn-warning btn-tab" value="url">Live Post URL</Tabs.Trigger>
              <div className='or-overlap'>OR</div>
              <Tabs.Trigger className='col-auto ps-4 btn btn-warning btn-tab' value="file" disabled={!post?.html_link}>Generated HTML</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="url">
              <div className="d-flex justify-content-center">
                <div className="input-group">
                  <input
                    placeholder="Enter URL to fact-check"
                    value={url}
                    name='url'
                    onChange={(e) => setUrl(e.target.value)}
                    type="url"
                    className='form-control bg-dark'
                  />
                  <button className="btn btn-primary input-group-append" onClick={() => handleUrlCheck()} disabled={isLoading || !url}>
                    {isLoading ? <div className='spinner-border spinner-border-sm' /> : 'Check'}
                  </button>
                </div>
              </div>
            </Tabs.Content>
            <Tabs.Content value="file">
              <div className="d-flex justify-content-center mt-3">
                <div className='input-group'>
                  <input
                    type="file"
                    className='bg-dark form-control'
                    accept=".txt,.html,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFile(e.target.files[0]);
                      }
                    }}
                  />

                  <button className='btn btn-primary input-group-append' onClick={handleFileCheck} disabled={isLoading || !file}>
                    {isLoading ? 'Checking...' : 'Check'}
                  </button>
                </div>
              </div>
            </Tabs.Content>
            {error && <p className='text-danger mt-2text-center'><strong>{error}</strong></p>}
          </Tabs.Root>
          {!isLoggedIn ? <div className='text-center mt-3'>
            Looking to save your fact checks? <a className='text-primary' onClick={loginHandler}>Login with Google</a> to access fact-check history and more!
          </div> : pathname === '/' ? <div className='text-center mt-3'>
            View your previous fact-checks <a className='text-primary' href="/fact-checks">My Fact-Checks</a>
          </div> : null}
        </div>
      </div>
    </div>
  );
}

export default FactCheckModal