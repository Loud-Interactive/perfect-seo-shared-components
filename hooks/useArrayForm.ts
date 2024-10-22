import { useEffect, useMemo, useState } from 'react';
import { FormController } from './useForm';

export interface ArrayFormConfig {
  arrayKey: string,
  objectTemplate: any,
  requiredKeys?: string[],
  validatedKeys?: string[],
  form: FormController
}

export interface ArrayFormController {
  getObjectState: Object,
  setObjectState: (Object) => void,
  getArrayState: any,
  setArrayState: (any) => void,
  setConfig: (Object) => void,
  getRequiredFields: string[],
  getValidatedFields: string[],
  addArrayObject: (Object) => void,
  removeArrayObject: (number) => void,
}

export default function useArrayForm(form): ArrayFormController {
  const [objectData, setObjectData] = useState<any>({});
  const [config, setConfig] = useState<ArrayFormConfig>({ arrayKey: '', objectTemplate: {}, form: form });

  // Prevents Update Loops 
  useEffect(() => {
    if (form?.getState) {
      let formState = JSON.stringify(form.getState);
      let thisState = JSON.stringify(objectData);

      if (formState !== thisState) {
        setObjectData(form.getState);
      }
    }
  }, [form?.getState]);

  // converts an object to array
  const objectDataToArray = (object: any) => {
    let arr: any[] = [];

    if (typeof object === 'object' && object) {
      let keyArray = Object.keys(object);

      if (keyArray.length > 0) {
        for (var idx in keyArray) {
          let obj = keyArray[idx];
          let objParts = obj.split('-');
          let i = objParts[1];
          let key = objParts[0];

          if (arr[i]) {
            arr[i][key] = object[obj];
          } else {
            let newObj = {};

            newObj[key] = object[obj];
            arr.push(newObj);
          }

        }
      }
    }
    return arr;
  };

  // hook for state of array 
  const [arrayState, setTheArrayState] = useState<any[]>([]);

  useEffect(() => {
    if (JSON.stringify(objectDataToArray(objectData)) !== JSON.stringify(arrayState)) {
      setTheArrayState(objectDataToArray(objectData));
    }
  }, [objectData]);

  // Converts array data to an object AND sets state 
  const arrayDataToObject = (array) => {
    let obj = {};

    if (Array.isArray(array) && array?.length > 0) {

      for (var i in array) {
        let object = array[i];

        if (Object.keys(object).length > 0) {
          let arrayKeys = Object.keys(object);

          for (var idx in arrayKeys) {
            let subObj = arrayKeys[idx];

            obj[`${subObj}-${i}`] = array[i][subObj];
          }
        }
      }
    }
    form.setState(obj);
    setObjectData(obj);
  };

  // Created required fields for form validation 
  const requiredFields = useMemo(() => {
    if (config && objectData) {
      let dataKeys = Object.keys(objectData);
      let newArray: any[] = dataKeys.map(obj => {
        let key = obj.split('-')[0];

        if (config.requiredKeys) {
          if (config.requiredKeys.includes(key)) {
            return obj;
          }
        }
      });

      return newArray.filter((obj) => obj !== undefined);
    } else return [];
  }, [config, objectData]);

  // creates validator fields for validation 
  const validatorFields = useMemo(() => {
    if (config && objectData !== null) {
      if (config.validatedKeys) {
        let dataKeys = Object.keys(objectData);
        let newArray: any[] = dataKeys.map(obj => {
          let key = obj.split('-')[0];

          if (config?.validatedKeys?.includes(key) && key !== undefined) {
            return obj.toString();
          }
        });

        return newArray.filter(obj => obj !== undefined);
      } else
        return [];

    }
    else return [];
  }, [config, objectData]);

  // Adds an object to your form and sets from 
  const addObjectToArray = (object) => {
    let newArray = arrayState;

    newArray.push(object);
    arrayDataToObject(newArray);
  };

  // Removes an object from for and sets form 
  const removeObjectFromArray = (i) => {
    let newData = objectDataToArray(objectData);

    let returnData = newData.slice(0, i).concat(newData.slice(i + 1));

    if (newData.length === 1) {
      arrayDataToObject([]);
    }

    arrayDataToObject(returnData);
  };

  // Allows user to set form data object directly from an array 
  const setArrayState = (array) => {
    arrayDataToObject(array);
  };

  return {
    getObjectState: objectData,
    setObjectState: state => setObjectData(state),
    getArrayState: arrayState,
    setArrayState: state => setArrayState(state),
    setConfig: newConfig => setConfig(newConfig),
    getRequiredFields: requiredFields,
    getValidatedFields: validatorFields,
    addArrayObject: object => addObjectToArray(object),
    removeArrayObject: index => removeObjectFromArray(index),
  };
}