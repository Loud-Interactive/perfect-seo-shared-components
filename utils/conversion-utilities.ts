
import { ContentIncomingProps, ContentRequestFormProps } from "@/perfect-seo-shared-components/data/types"


export const urlSanitization = (url: string): string => {
  return url?.replaceAll("https://", "").replaceAll("http://", "").replaceAll("www.", "").replaceAll("/", "").toLowerCase().replaceAll("sc-domain:", "")
}


export const findUniqueKeys = (newObj, oldObj) => {
  let keys = Object.keys(newObj)
  let finalObj = keys.reduce((prev, curr) => {
    if (newObj[curr] !== oldObj[curr]) {
      return ({ ...prev, [curr]: newObj[curr] })
    }
    else {
      return prev
    }
  }, {})
  return finalObj
}

export const getAverage = (arr: number[]) => {
  let quantity = arr.length;
  let sum = arr.reduce((prev, curr) => prev + curr, 0)

  return sum / quantity
}


export const convertArrayToObject = (arr: any[]) => {
  let obj = arr.reduce((prev, curr) => {
    return ({ ...prev, [curr.key]: curr.value })
  }, {})
  return obj
}



export const convertFormDataToOutgoing = (data: ContentRequestFormProps): ContentIncomingProps => {
  return ({
    email: data.email,
    domain_name: data?.domainName && urlSanitization(data?.domainName),
    brand_name: data?.brandName,
    target_keyword: data?.targetKeyword,
    priority_code: data?.priorityCode && urlSanitization(data?.priorityCode),
    entity_voice: data?.entityVoice,
    inspiration_url_1: data?.url1,
    priority1: data?.priority1,
    inspiration_url_2: data?.url2,
    priority2: data?.priority2,
    inspiration_url_3: data?.url3,
    priority3: data?.priority3
  })

}

export const convertIncomingToFormData = (data: ContentIncomingProps) => {
  return (
    {
      email: data?.email,
      domainName: data?.domain_name,
      brandName: data?.brand_name,
      targetKeyword: data?.target_keyword,
      priorityCode: data?.priority_code,
      entityVoice: data?.entity_voice,
      url1: data?.inspiration_url_1,
      priority1: data?.priority1,
      url2: data?.inspiration_url_2,
      priority2: data?.priority2,
      url3: data?.inspiration_url_3,
      priority3: data?.priority3
    }
  )
}

