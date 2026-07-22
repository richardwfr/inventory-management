#!/usr/bin/env node

/**
 * Vue Component Structure Analyzer
 * Analyzes Vue 3 components for performance and code reuse opportunities
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

const FINDINGS = {
  CRITICAL: '🔴',
  WARNING: '🟡',
  SUGGESTION: '🟢'
}

class VueAnalyzer {
  constructor() {
    this.findings = []
    this.files = []
  }

  analyze(pattern) {
    // Resolve file pattern
    const files = this.resolvePattern(pattern)
    this.files = files

    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8')
      this.analyzeFile(file, content)
    })

    return this.generateReport()
  }

  resolvePattern(pattern) {
    const baseDir = path.join(__dirname, '..')
    const fullPattern = path.join(baseDir, pattern)

    // If it's a directory, search for Vue files
    if (fs.existsSync(fullPattern) && fs.statSync(fullPattern).isDirectory()) {
      return glob.sync(`${fullPattern}/**/*.vue`)
    }

    // If it's a glob pattern
    if (pattern.includes('*')) {
      return glob.sync(fullPattern)
    }

    // Single file
    return [fullPattern]
  }

  analyzeFile(filePath, content) {
    const lines = content.split('\n')
    const relativePath = path.relative(process.cwd(), filePath)

    // Parse component structure
    const template = this.extractSection(content, 'template')
    const script = this.extractSection(content, 'script')
    const style = this.extractSection(content, 'style')

    // Run checks
    this.checkPerformance(relativePath, template, script, lines)
    this.checkCodeReuse(relativePath, script, lines)
    this.checkBestPractices(relativePath, script, template, lines)
    this.checkComponentSize(relativePath, content, lines)
  }

  extractSection(content, section) {
    const regex = new RegExp(`<${section}[^>]*>([\\s\\S]*?)<\/${section}>`, 'i')
    const match = content.match(regex)
    return match ? match[1] : ''
  }

  checkPerformance(file, template, script, lines) {
    // Check for v-if that could be v-show
    const vIfMatches = [...template.matchAll(/v-if="[^"]*"\s*(?=[\s\S]*?(?:@(?:click|change|toggle)|:class.*?active))/gi)]
    vIfMatches.forEach((match, idx) => {
      const lineNum = content.substring(0, match.index).split('\n').length
      this.addFinding(file, lineNum, 'performance', 'v-if for frequently toggled element',
        'Use v-show instead for better performance when toggling visibility frequently', FINDINGS.WARNING)
    })

    // Check for methods that should be computed
    const methodMatches = [...script.matchAll(/(\w+)\s*\(\s*\)\s*{[\s\S]*?(?:return|:)/gi)]
    methodMatches.forEach(match => {
      if (match[1] && !['onMounted', 'onUnmounted', 'loadData', 'reset', 'submit'].includes(match[1])) {
        // Simple heuristic: if it has return and no side effects, suggest computed
        const lineNum = this.findLineNumber(match[0], lines)
        if (lineNum > 0) {
          this.addFinding(file, lineNum, 'performance', `Method '${match[1]}' could be computed`,
            'If this method only returns a value without side effects, make it a computed property', FINDINGS.SUGGESTION)
        }
      }
    })

    // Check for missing v-for keys
    const vForMatches = [...template.matchAll(/v-for="[^"]*"\s+(?!:key)/gi)]
    if (vForMatches.length > 0) {
      const lineNum = this.findLineNumber(vForMatches[0][0], lines)
      this.addFinding(file, lineNum, 'performance', 'Missing or incomplete v-for key',
        'Always use unique keys (not index) for v-for loops', FINDINGS.CRITICAL)
    }

    // Check for watchers that could be computed
    const watchMatches = [...script.matchAll(/watch\s*\(\s*(\w+),\s*\([^)]*\)\s*=>\s*{[\s\S]*?}\s*\)/gi)]
    watchMatches.forEach(match => {
      const lineNum = this.findLineNumber(match[0], lines)
      if (lineNum > 0) {
        this.addFinding(file, lineNum, 'performance', `Watcher on '${match[1]}' might be over-engineered`,
          'If this just derives a value, consider using a computed property instead', FINDINGS.SUGGESTION)
      }
    })
  }

  checkCodeReuse(file, script, lines) {
    // Check for repeated patterns
    const apiCallPattern = /\bawait\s+(?:api\.|fetch\()/gi
    const apiCalls = [...script.matchAll(apiCallPattern)]
    if (apiCalls.length > 2) {
      this.addFinding(file, this.findLineNumber(apiCalls[0][0], lines), 'reuse',
        'Multiple API calls in component',
        'Consider extracting to a composable for code reuse', FINDINGS.SUGGESTION)
    }

    // Check for loading/error state patterns
    const loadingPattern = /loading\s*=\s*ref\(.*?\)[\s\S]*?error\s*=\s*ref\(.*?\)/gi
    if (loadingPattern.test(script)) {
      this.addFinding(file, this.findLineNumber(script.substring(0, 100), lines), 'reuse',
        'Standard loading/error state pattern detected',
        'Extract to composable: useAsyncData() or useApiCall()', FINDINGS.SUGGESTION)
    }
  }

  checkBestPractices(file, script, template, lines) {
    // Check for prop mutation
    if (/props\.\w+\s*=/gi.test(script)) {
      const match = script.match(/props\.(\w+)\s*=/i)
      const lineNum = this.findLineNumber(match[0], lines)
      this.addFinding(file, lineNum, 'best-practice', 'Direct prop mutation',
        'Emit event to parent instead: emit(\'update:prop\', value)', FINDINGS.CRITICAL)
    }

    // Check for date handling
    if (/new\s+Date\([^)]*\)\.get(?:Month|Time)/gi.test(script)) {
      this.addFinding(file, this.findLineNumber(script, lines), 'best-practice',
        'Unsafe date parsing without validation',
        'Validate date before calling .getMonth() or other methods', FINDINGS.WARNING)
    }

    // Check for hardcoded formatting
    if (/toLocaleString|toFixed|toUpperCase/gi.test(template)) {
      this.addFinding(file, this.findLineNumber(template, lines), 'best-practice',
        'Number/string formatting in template',
        'Move to computed property or method for maintainability', FINDINGS.SUGGESTION)
    }
  }

  checkComponentSize(file, content, lines) {
    const lineCount = lines.length
    if (lineCount > 200) {
      this.addFinding(file, 1, 'structure', `Large component (${lineCount} lines)`,
        'Consider splitting into smaller, focused components', FINDINGS.WARNING)
    }
  }

  addFinding(file, line, category, issue, recommendation, severity) {
    this.findings.push({
      file,
      line,
      category,
      issue,
      recommendation,
      severity
    })
  }

  findLineNumber(text, lines) {
    if (!text) return 1
    const searchText = text.substring(0, 30)
    return lines.findIndex(l => l.includes(searchText)) + 1 || 1
  }

  generateReport() {
    const report = []
    report.push('# Vue Component Analysis Report\n')

    // Summary
    report.push('## Summary')
    report.push(`- Files analyzed: ${this.files.length}`)
    report.push(`- Total findings: ${this.findings.length}`)
    report.push(`- Critical issues: ${this.findings.filter(f => f.severity === FINDINGS.CRITICAL).length}`)
    report.push(`- Warnings: ${this.findings.filter(f => f.severity === FINDINGS.WARNING).length}`)
    report.push(`- Suggestions: ${this.findings.filter(f => f.severity === FINDINGS.SUGGESTION).length}\n`)

    // Group by file
    const byFile = {}
    this.findings.forEach(f => {
      if (!byFile[f.file]) byFile[f.file] = []
      byFile[f.file].push(f)
    })

    // Report by file
    Object.entries(byFile).forEach(([file, findings]) => {
      const criticalCount = findings.filter(f => f.severity === FINDINGS.CRITICAL).length
      report.push(`## ${file} ${criticalCount > 0 ? '🔴' : '🟡'}\n`)

      // Group by category
      const byCategory = {}
      findings.forEach(f => {
        if (!byCategory[f.category]) byCategory[f.category] = []
        byCategory[f.category].push(f)
      })

      Object.entries(byCategory).forEach(([category, items]) => {
        report.push(`### ${category.charAt(0).toUpperCase() + category.slice(1)}`)
        items.forEach(item => {
          report.push(`${item.severity} **Line ${item.line}**: ${item.issue}`)
          report.push(`   → ${item.recommendation}\n`)
        })
      })
    })

    // Metrics
    report.push('## Metrics')
    report.push(`- Average component size: ${Math.round(this.files.length > 0 ? this.findings.length / this.files.length : 0)} findings per file`)
    report.push(`- Most common issue: ${this.getMostCommonIssue()}`)
    report.push(`- Recommended improvements: ${this.getRecommendations()}\n`)

    return report.join('\n')
  }

  getMostCommonIssue() {
    const categories = {}
    this.findings.forEach(f => {
      categories[f.category] = (categories[f.category] || 0) + 1
    })
    return Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'
  }

  getRecommendations() {
    const hasComposables = this.findings.some(f => f.recommendation.includes('composable'))
    const hasComputed = this.findings.some(f => f.recommendation.includes('computed'))
    const recs = []
    if (hasComposables) recs.push('extract composables')
    if (hasComputed) recs.push('use computed properties')
    if (recs.length === 0) recs.push('improve code organization')
    return recs.join(', ')
  }
}

// Run analyzer
const pattern = process.argv[2] || 'client/src'
const analyzer = new VueAnalyzer()
const report = analyzer.analyze(pattern)
console.log(report)

// Optionally save to file
if (process.argv[3] === '--save') {
  fs.writeFileSync('vue-analysis-report.md', report)
  console.log('\n✅ Report saved to vue-analysis-report.md')
}
