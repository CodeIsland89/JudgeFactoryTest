import dotenv from "dotenv";
import JudgeFactory from "./judgeFactory";

dotenv.config();

type Testset = {
  input: string;
  expectOutput: string;
}

async function runWithTest() {
  const databasePrintFunctionName = "print"
  const databaseFunctionName = "sum"
  const databaseTestsets: Testset[] = [
    {
      input: "1,2",
      expectOutput: "3"
    },
    {
      input: "2,3",
      expectOutput: "6"
    }
  ]

  const frontendPassCode = `def sum(a,b):
    return a+b
  `

  const results = await Promise.all(databaseTestsets.map(async (testset) => {
    const judgeFactory = JudgeFactory({})

    const runner = await judgeFactory
      .addLanguageId("70")
      .sourceCodeWrapper(frontendPassCode)
      .editSourceCode((prevSourceCode) => prevSourceCode + addRunTestPrompt(databasePrintFunctionName, databaseFunctionName, testset.input))
      .flatSourceCode()
      .wrapJudge()
    
    const data = await runner.excute()
    const excuteResult = data.stdout.trim()
    if (excuteResult !== testset.expectOutput) {
      return {
        isSuccess: false,
        input: testset.input,
        expectOutput: testset.expectOutput,
        actualOutput: excuteResult
      }
    } else {
      return {
        isSuccess: true,
      }
    }
  }))

  console.log(results)
}

const quickRun = async () => {
  const judgeFactory = JudgeFactory({})
  const frontendPassCode = `print("haha")`
  const frontendPassLanguageId = "70"

  const runner = await judgeFactory
    .addLanguageId(frontendPassLanguageId)
    .sourceCodeWrapper(frontendPassCode)
    .flatSourceCode()
    .wrapJudge()
  
  const data = await runner.excute()
  console.log(data)
}

const addRunTestPrompt = (printFunctionName: string,functionName: string, input: string) => {
  return `${printFunctionName}(${functionName}(${input})) `
}

// runWithTest()
// quickRun()


