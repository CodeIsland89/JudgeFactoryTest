import axios from "axios"

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

type JudgeFactoryProps = {
  sourceCode?: string;
  languageId?: string;
}

export default function JudgeFactory(props: JudgeFactoryProps) {

  const { sourceCode, languageId } = props

  function wrapJudge() {
    if (!sourceCode || !languageId) throw new Error("sourceCode or languageId is not defined");
    return judgeWrapper({ sourceCode, languageId })
  }
  
  return ({
    sourceCodeWrapper: (initialSourceCode: string) => sourceCodeWrapper({ ...props, sourceCode: initialSourceCode }),
    addLanguageId: (languageId: string) => {
      return JudgeFactory({
        ...props,
        languageId
      })
    },
    wrapJudge: wrapJudge,
  })

}

function sourceCodeWrapper(props: WithRequired<JudgeFactoryProps, 'sourceCode'>) {
  return ({
    editSourceCode: (editFunction: (prevString: string) => string) => {
      const { sourceCode } = props
      return sourceCodeWrapper({...props, sourceCode: editFunction(sourceCode + "\n")})
    },
    flatSourceCode: () => {
      return JudgeFactory(props)
    }
  })
}


type JudgeWrapperProps = {
  sourceCode: string;
  languageId: string;
}

type JudgeResponse = {
  stdout: string;
  stderr: string;
  time: string;
  memory: number
}

async function judgeWrapper({ sourceCode, languageId }: JudgeWrapperProps) {

  const judgeURL = process.env.judge_server_url
  const fetchURL = `${judgeURL}/submissions/?base64_encoded=false&wait=true`

  return {
    excute: async (): Promise<JudgeResponse> => {
      const data: JudgeResponse = await axios.post(fetchURL, {
        source_code: sourceCode,
        language_id: languageId,
      }).then(res => {
        const { stdout, stderr, time, memory } = res.data
        return {
          stdout,
          stderr,
          time,
          memory
        }
      })
      return data
    }
  }
}